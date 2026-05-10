let sondeos = [];
let graficaVs30 = null;

/* =========================================================
   CONFIGURACIÓN ARCGIS ONLINE
   Pega aquí la URL REST de tu capa.
   Debe terminar en /FeatureServer/0
========================================================= */

const AGOL_FEATURE_LAYER_URL = "https://services6.arcgis.com/vQa0SVm7Y0deDYFA/arcgis/rest/services/Sondeos_Campo_SantaFe_Publica_OK/FeatureServer/0";

/*
  Ajusta estos nombres si tus campos en ArcGIS Online se llaman distinto.

  Ejemplos posibles:
  id: "ID", "Id", "Borehole", "Sondeo"
  tipo: "tipo", "Tipo", "TIPO_SUELO", "Litologia"
  vs30: "vs30", "Vs30", "VS30"
  gmax: "gmax", "Gmax", "GMAX"
  estado: "estado", "Estado", "ESTADO"
*/

const CAMPOS_AGOL = {
  id: "ID",
  tipo: "Tipo_Suelo",
  vs30: "Vs30",
  gmax: "Gmax",
  estado: "Estado"
};

/* =========================================================
   PLUGIN: LÍNEA HORIZONTAL DE UMBRAL Vs30 = 360 m/s
========================================================= */

const umbralVs30Plugin = {
  id: "umbralVs30Plugin",

  afterDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const yScale = scales.y;

    if (!chartArea || !yScale) return;

    const umbral = 360;
    const y = yScale.getPixelForValue(umbral);

    if (y < chartArea.top || y > chartArea.bottom) return;

    ctx.save();

    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "rgba(15, 23, 42, 0.45)";
    ctx.lineWidth = 1.4;
    ctx.moveTo(chartArea.left, y);
    ctx.lineTo(chartArea.right, y);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.font = "600 12px Inter, sans-serif";
    ctx.fillText("Umbral 360 m/s", chartArea.left + 8, y - 8);

    ctx.restore();
  }
};

/* =========================================================
   CARGA DE DATOS DESDE ARCGIS ONLINE
========================================================= */

async function cargarSondeos() {
  try {
    if (
      !AGOL_FEATURE_LAYER_URL ||
      AGOL_FEATURE_LAYER_URL.includes("PEGA_AQUI")
    ) {
      throw new Error("Falta configurar la URL de la capa de ArcGIS Online.");
    }

    const parametros = new URLSearchParams({
      f: "json",
      where: "1=1",
      outFields: "*",
      returnGeometry: "false"
    });

    const urlConsulta = `${AGOL_FEATURE_LAYER_URL}/query?${parametros.toString()}`;

    console.log("Consultando ArcGIS Online:", urlConsulta);

    const respuesta = await fetch(urlConsulta);

    if (!respuesta.ok) {
      throw new Error("No se pudo conectar con ArcGIS Online.");
    }

    const datos = await respuesta.json();

    if (datos.error) {
      throw new Error(datos.error.message || "Error devuelto por ArcGIS Online.");
    }

    if (!datos.features || datos.features.length === 0) {
      sondeos = [];
      actualizarGrafica();
      return;
    }

    sondeos = datos.features
      .map(feature => normalizarSondeo(feature.attributes))
      .filter(s => s !== null);

    console.log("Sondeos cargados desde ArcGIS Online:", sondeos);

    actualizarGrafica();

  } catch (error) {
    console.error("Error cargando datos desde ArcGIS Online:", error);

    const tabla = document.getElementById("tablaSondeos");

    if (tabla) {
      tabla.innerHTML = `
        <tr>
          <td colspan="6">
            No se han podido cargar los datos desde ArcGIS Online.
            Revisa la URL de la capa, los permisos públicos y los nombres de campos.
          </td>
        </tr>
      `;
    }

    const stats = document.getElementById("stats");

    if (stats) {
      stats.innerHTML = "No se han podido cargar las estadísticas.";
    }
  }
}

/* =========================================================
   NORMALIZACIÓN DE DATOS DE ARCGIS ONLINE
========================================================= */

function normalizarSondeo(atributos) {
  const id = obtenerValorCampo(atributos, CAMPOS_AGOL.id);
  const tipoOriginal = obtenerValorCampo(atributos, CAMPOS_AGOL.tipo);
  const vs30 = Number(obtenerValorCampo(atributos, CAMPOS_AGOL.vs30));
  const gmax = Number(obtenerValorCampo(atributos, CAMPOS_AGOL.gmax));
  const estado = obtenerValorCampo(atributos, CAMPOS_AGOL.estado) || "Sin revisar";

  if (!id || isNaN(vs30)) {
    return null;
  }

  return {
    id: id,
    tipo: normalizarTipoSuelo(tipoOriginal),
    vs30: vs30,
    gmax: isNaN(gmax) ? 0 : gmax,
    estado: estado
  };
}

function obtenerValorCampo(atributos, nombreCampo) {
  if (!atributos || !nombreCampo) return null;

  if (atributos[nombreCampo] !== undefined && atributos[nombreCampo] !== null) {
    return atributos[nombreCampo];
  }

  const campoEncontrado = Object.keys(atributos).find(
    key => key.toLowerCase() === nombreCampo.toLowerCase()
  );

  if (campoEncontrado) {
    return atributos[campoEncontrado];
  }

  return null;
}

function normalizarTipoSuelo(valor) {
  if (!valor) return "noclasificado";

  const texto = String(valor).toLowerCase().trim();

  if (
    texto.includes("granular") ||
    texto.includes("arena") ||
    texto.includes("grava")
  ) {
    return "granular";
  }

  if (
    texto.includes("cohesivo") ||
    texto.includes("arcilla") ||
    texto.includes("limo")
  ) {
    return "cohesivo";
  }

  if (
    texto.includes("no clasificado") ||
    texto.includes("noclasificado") ||
    texto.includes("sin clasificar")
  ) {
    return "noclasificado";
  }

  return texto;
}

/* =========================================================
   CALCULADORA Vs30
========================================================= */

function calcularVs30() {
  const inputN60 = document.getElementById("n60");
  const resultado = document.getElementById("resultadoVs30");
  const inputVs30Gmax = document.getElementById("vs30gmax");

  const n60 = parseFloat(inputN60.value);

  if (isNaN(n60) || n60 <= 0) {
    resultado.innerHTML = "Introduce un valor N válido.";
    return;
  }

  const vs30 = 259.24 * Math.pow(n60, 0.05);
  const clase = clasificarVs30(vs30);

  resultado.innerHTML =
    "Vs30 = " + vs30.toFixed(2) + " m/s<br>" +
    "Clasificación sísmica: " + clase;

  inputVs30Gmax.value = vs30.toFixed(2);

  agregarValorCalculado(vs30);
}

/* =========================================================
   CALCULADORA Gmax
========================================================= */

function calcularGmax() {
  const densidad = parseFloat(document.getElementById("densidad").value);
  const vs30 = parseFloat(document.getElementById("vs30gmax").value);
  const resultado = document.getElementById("resultadoGmax");

  if (isNaN(densidad) || densidad <= 0 || isNaN(vs30) || vs30 <= 0) {
    resultado.innerHTML = "Introduce densidad y Vs30 válidos.";
    return;
  }

  const gmax = densidad * Math.pow(vs30, 2);

  resultado.innerHTML = "Gmax = " + formatearNumero(gmax);
}

/* =========================================================
   CLASIFICACIÓN Vs30
========================================================= */

function clasificarVs30(vs30) {
  const normativaSelect = document.getElementById("normativa");
  const normativa = normativaSelect ? normativaSelect.value : "ncsr02";

  if (normativa === "ncsr02") {
    if (vs30 > 750) return "Tipo A";
    if (vs30 >= 360) return "Tipo B";
    if (vs30 >= 180) return "Tipo C";
    return "Tipo D";
  }

  if (normativa === "ec8") {
    if (vs30 > 800) return "Clase A";
    if (vs30 >= 360) return "Clase B";
    if (vs30 >= 180) return "Clase C";
    return "Clase D";
  }

  return "Sin clasificar";
}

function obtenerColorVs30(vs30) {
  if (vs30 >= 800) {
    return "rgba(22, 163, 74, 0.85)";
  }

  if (vs30 >= 360) {
    return "rgba(37, 99, 235, 0.85)";
  }

  if (vs30 >= 180) {
    return "rgba(245, 158, 11, 0.85)";
  }

  return "rgba(220, 38, 38, 0.85)";
}

/* =========================================================
   GRÁFICA
========================================================= */

function inicializarGrafica() {
  const canvas = document.getElementById("graficaVs30");

  if (!canvas) {
    console.error("No se ha encontrado el canvas con id graficaVs30.");
    return;
  }

  if (typeof Chart === "undefined") {
    console.error("Chart.js no se ha cargado.");
    return;
  }

  graficaVs30 = new Chart(canvas, {
    type: "bar",

    data: {
      labels: [],
      datasets: [
        {
          label: "Vs30",
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1.5,
          borderRadius: 8,
          maxBarThickness: 48
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        mode: "index",
        intersect: false
      },

      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 10,
            color: "#334155",
            font: {
              size: 13,
              weight: "700"
            }
          }
        },

        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          titleColor: "#ffffff",
          bodyColor: "#e2e8f0",
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: function(context) {
              const valor = Number(context.raw);
              return "Vs30: " + valor.toFixed(2) + " m/s";
            }
          }
        }
      },

      scales: {
        x: {
          ticks: {
            color: "#475569",
            maxRotation: 45,
            minRotation: 0
          },
          grid: {
            display: false
          }
        },

        y: {
          beginAtZero: true,
          suggestedMax: 450,
          title: {
            display: true,
            text: "Vs30 m/s",
            color: "#334155",
            font: {
              size: 13,
              weight: "700"
            }
          },
          ticks: {
            color: "#475569"
          },
          grid: {
            color: "rgba(148, 163, 184, 0.25)"
          }
        }
      }
    },

    plugins: [umbralVs30Plugin]
  });
}

function actualizarGrafica() {
  const selectorSuelo = document.getElementById("suelo");

  if (!selectorSuelo) {
    console.error("No se ha encontrado el selector con id suelo.");
    return;
  }

  const tipo = selectorSuelo.value;

  const datosFiltrados = sondeos
    .filter(s => s.tipo === tipo)
    .sort((a, b) => a.vs30 - b.vs30);

  actualizarTabla(datosFiltrados);
  actualizarEstadisticas(datosFiltrados, tipo);

  if (!graficaVs30) {
    console.warn("La gráfica todavía no está inicializada.");
    return;
  }

  const labels = datosFiltrados.map(s => "Sondeo " + s.id);
  const valores = datosFiltrados.map(s => s.vs30);

  const etiquetas = {
    granular: "Vs30 - Suelo granular",
    cohesivo: "Vs30 - Suelo cohesivo",
    noclasificado: "Vs30 - Zona no clasificada"
  };

  const coloresVs30 = valores.map(v => obtenerColorVs30(v));
  const bordesVs30 = coloresVs30.map(color => color.replace("0.85", "1"));

  graficaVs30.data.labels = labels;
  graficaVs30.data.datasets[0].label = etiquetas[tipo] || "Vs30";
  graficaVs30.data.datasets[0].data = valores;
  graficaVs30.data.datasets[0].backgroundColor = coloresVs30;
  graficaVs30.data.datasets[0].borderColor = bordesVs30;

  graficaVs30.update();
}

function agregarValorCalculado(vs30) {
  if (!graficaVs30) return;

  const valor = Number(vs30.toFixed(2));
  const color = obtenerColorVs30(valor);

  graficaVs30.data.labels.push("Calculado");
  graficaVs30.data.datasets[0].data.push(valor);
  graficaVs30.data.datasets[0].backgroundColor.push(color);
  graficaVs30.data.datasets[0].borderColor.push(color.replace("0.85", "1"));

  graficaVs30.update();
}

/* =========================================================
   TABLA
========================================================= */

function actualizarTabla(datos) {
  const tabla = document.getElementById("tablaSondeos");

  if (!tabla) {
    console.error("No se ha encontrado la tabla con id tablaSondeos.");
    return;
  }

  tabla.innerHTML = "";

  if (!datos || datos.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="6">No hay sondeos para el tipo de suelo seleccionado.</td>
      </tr>
    `;
    return;
  }

  datos.forEach(s => {
    tabla.innerHTML += `
      <tr>
        <td>Sondeo ${s.id}</td>
        <td>${capitalizar(s.tipo)}</td>
        <td>${Number(s.vs30).toFixed(2)} m/s</td>
        <td>${clasificarVs30(Number(s.vs30))}</td>
        <td>${formatearNumero(Number(s.gmax))}</td>
        <td>${s.estado}</td>
      </tr>
    `;
  });
}

/* =========================================================
   ESTADÍSTICAS
========================================================= */

function actualizarEstadisticas(datosFiltrados, tipoSeleccionado) {
  const stats = document.getElementById("stats");

  if (!stats) {
    console.error("No se ha encontrado el contenedor con id stats.");
    return;
  }

  if (!datosFiltrados || datosFiltrados.length === 0) {
    stats.innerHTML =
      "Tipo seleccionado <strong>" + obtenerNombreTipo(tipoSeleccionado) + "</strong><br>" +
      "Sondeos filtrados <strong>0</strong><br>" +
      "Vs30 promedio <strong>-</strong><br>" +
      "Gmax promedio <strong>-</strong>";
    return;
  }

  const total = datosFiltrados.length;

  const mediaVs30 =
    datosFiltrados.reduce((acc, s) => acc + Number(s.vs30), 0) / total;

  const mediaGmax =
    datosFiltrados.reduce((acc, s) => acc + Number(s.gmax), 0) / total;

  stats.innerHTML =
    "Tipo seleccionado <strong>" + obtenerNombreTipo(tipoSeleccionado) + "</strong><br>" +
    "Sondeos filtrados <strong>" + total + "</strong><br>" +
    "Vs30 promedio <strong>" + mediaVs30.toFixed(2) + " m/s</strong><br>" +
    "Gmax promedio <strong>" + formatearNumero(mediaGmax) + "</strong>";
}

function obtenerNombreTipo(tipo) {
  const nombres = {
    granular: "Suelo granular",
    cohesivo: "Suelo cohesivo",
    noclasificado: "Zona no clasificada"
  };

  return nombres[tipo] || "Sin clasificar";
}

/* =========================================================
   UTILIDADES
========================================================= */

function formatearNumero(valor) {
  return Number(valor).toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

function capitalizar(texto) {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/* =========================================================
   INICIO DE LA APLICACIÓN
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  console.log("script.js cargado correctamente.");

  const selectorSuelo = document.getElementById("suelo");
  const selectorNormativa = document.getElementById("normativa");

  if (selectorSuelo) {
    selectorSuelo.addEventListener("change", actualizarGrafica);
  }

  if (selectorNormativa) {
    selectorNormativa.addEventListener("change", actualizarGrafica);
  }

  inicializarGrafica();
  cargarSondeos();
});
