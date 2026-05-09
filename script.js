let sondeos = [];
let graficaVs30;

async function cargarSondeos() {
  const respuesta = await fetch("sondeos.json");
  sondeos = await respuesta.json();

  actualizarGrafica();
  actualizarEstadisticas();
}

function calcularVs30() {
  let n60 = parseFloat(document.getElementById("n60").value);

  if (isNaN(n60) || n60 <= 0) {
    document.getElementById("resultadoVs30").innerHTML =
      "Introduce un valor N válido.";
    return;
  }

  let vs30 = 259.24 * Math.pow(n60, 0.05);
  let clase = clasificarVs30(vs30);

  document.getElementById("resultadoVs30").innerHTML =
    "Vs30 = " + vs30.toFixed(2) + " m/s<br>" +
    "Clasificación sísmica: " + clase;

  document.getElementById("vs30gmax").value = vs30.toFixed(2);

  agregarValorCalculado(vs30);
}

function calcularGmax() {
  let densidad = parseFloat(document.getElementById("densidad").value);
  let vs30 = parseFloat(document.getElementById("vs30gmax").value);

  if (isNaN(densidad) || isNaN(vs30)) {
    document.getElementById("resultadoGmax").innerHTML =
      "Introduce densidad y Vs30 válidos.";
    return;
  }

  let gmax = densidad * Math.pow(vs30, 2);

  document.getElementById("resultadoGmax").innerHTML =
    "Gmax = " + gmax.toLocaleString("es-ES", {
      maximumFractionDigits: 2
    });
}

function clasificarVs30(vs30) {
  let normativa = document.getElementById("normativa").value;

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
}

function actualizarGrafica() {
  let tipo = document.getElementById("suelo").value;

  let datosFiltrados = sondeos
    .filter(s => s.tipo === tipo)
    .sort((a, b) => a.vs30 - b.vs30);

  let labels = datosFiltrados.map(s => "Sondeo " + s.id);
  let valores = datosFiltrados.map(s => s.vs30);

  let etiquetas = {
    granular: "Vs30 - Suelo granular",
    cohesivo: "Vs30 - Suelo cohesivo",
    noclasificado: "Vs30 - Zona no clasificada"
  };

  let coloresVs30 = valores.map(v => obtenerColorVs30(v));
  let bordesVs30 = coloresVs30.map(color => color.replace("0.85", "1"));

  graficaVs30.data.labels = labels;
  graficaVs30.data.datasets[0].label = etiquetas[tipo];
  graficaVs30.data.datasets[0].data = valores;
  graficaVs30.data.datasets[0].backgroundColor = coloresVs30;
  graficaVs30.data.datasets[0].borderColor = bordesVs30;

  actualizarTabla(datosFiltrados);
  graficaVs30.update();
}

function actualizarTabla(datos) {
  const tabla = document.getElementById("tablaSondeos");

  tabla.innerHTML = "";

  datos.forEach(s => {
    tabla.innerHTML += `
      <tr>
        <td>Sondeo ${s.id}</td>
        <td>${s.tipo}</td>
        <td>${s.vs30.toFixed(2)} m/s</td>
        <td>${s.gmax.toLocaleString("es-ES", { maximumFractionDigits: 2 })}</td>
        <td>${s.estado}</td>
      </tr>
    `;
  });
}

function agregarValorCalculado(vs30) {
  let valor = Number(vs30.toFixed(2));
  let color = obtenerColorVs30(valor);

  graficaVs30.data.labels.push("Calculado");
  graficaVs30.data.datasets[0].data.push(valor);
  graficaVs30.data.datasets[0].backgroundColor.push(color);
  graficaVs30.data.datasets[0].borderColor.push(color.replace("0.85", "1"));

  graficaVs30.update();
}

function actualizarEstadisticas() {
  const total = sondeos.length;
  const mediaVs30 = sondeos.reduce((acc, s) => acc + s.vs30, 0) / total;
  const mediaGmax = sondeos.reduce((acc, s) => acc + s.gmax, 0) / total;

  document.getElementById("stats").innerHTML =
    "Sondeos Realizados <strong>" + total + "</strong><br>" +
    "Vs30 Promedio <strong>" + mediaVs30.toFixed(2) + " m/s</strong><br>" +
    "Gmax Promedio <strong>" + mediaGmax.toLocaleString("es-ES", {
      maximumFractionDigits: 2
    }) + "</strong>";
}

const ctx = document.getElementById("graficaVs30");

graficaVs30 = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [{
      label: "Vs30",
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1.5,
      borderRadius: 8,
      maxBarThickness: 42
    }]
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
          boxWidth: 10,
          color: "#334155",
          font: {
            size: 13,
            weight: "600"
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
            return "Vs30: " + context.raw.toFixed(2) + " m/s";
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#475569",
          maxRotation: 60,
          minRotation: 0
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
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
          color: "rgba(148, 163, 184, 0.25)"let sondeos = [];
let graficaVs30;

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

async function cargarSondeos() {
  try {
    const respuesta = await fetch("sondeos.json");

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar sondeos.json");
    }

    sondeos = await respuesta.json();

    actualizarGrafica();
    actualizarEstadisticas();
  } catch (error) {
    console.error(error);

    const tabla = document.getElementById("tablaSondeos");
    tabla.innerHTML = `
      <tr>
        <td colspan="6">
          No se han podido cargar los datos. Abre el proyecto con Live Server o revisa sondeos.json.
        </td>
      </tr>
    `;
  }
}

function calcularVs30() {
  const n60 = parseFloat(document.getElementById("n60").value);

  if (isNaN(n60) || n60 <= 0) {
    document.getElementById("resultadoVs30").innerHTML =
      "Introduce un valor N válido.";
    return;
  }

  const vs30 = 259.24 * Math.pow(n60, 0.05);
  const clase = clasificarVs30(vs30);

  document.getElementById("resultadoVs30").innerHTML =
    "Vs30 = " + vs30.toFixed(2) + " m/s<br>" +
    "Clasificación sísmica: " + clase;

  document.getElementById("vs30gmax").value = vs30.toFixed(2);

  agregarValorCalculado(vs30);
}

function calcularGmax() {
  const densidad = parseFloat(document.getElementById("densidad").value);
  const vs30 = parseFloat(document.getElementById("vs30gmax").value);

  if (isNaN(densidad) || densidad <= 0 || isNaN(vs30) || vs30 <= 0) {
    document.getElementById("resultadoGmax").innerHTML =
      "Introduce densidad y Vs30 válidos.";
    return;
  }

  const gmax = densidad * Math.pow(vs30, 2);

  document.getElementById("resultadoGmax").innerHTML =
    "Gmax = " + formatearNumero(gmax);
}

function clasificarVs30(vs30) {
  const normativa = document.getElementById("normativa").value;

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

function actualizarGrafica() {
  const tipo = document.getElementById("suelo").value;

  const datosFiltrados = sondeos
    .filter(s => s.tipo === tipo)
    .sort((a, b) => a.vs30 - b.vs30);

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

  actualizarTabla(datosFiltrados);
  graficaVs30.update();
}

function actualizarTabla(datos) {
  const tabla = document.getElementById("tablaSondeos");

  tabla.innerHTML = "";

  if (datos.length === 0) {
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
        <td>${s.vs30.toFixed(2)} m/s</td>
        <td>${clasificarVs30(s.vs30)}</td>
        <td>${formatearNumero(s.gmax)}</td>
        <td>${s.estado}</td>
      </tr>
    `;
  });
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

function actualizarEstadisticas() {
  const total = sondeos.length;

  if (total === 0) {
    document.getElementById("stats").innerHTML =
      "No hay sondeos cargados.";
    return;
  }

  const mediaVs30 = sondeos.reduce((acc, s) => acc + s.vs30, 0) / total;
  const mediaGmax = sondeos.reduce((acc, s) => acc + s.gmax, 0) / total;

  document.getElementById("stats").innerHTML =
    "Sondeos realizados <strong>" + total + "</strong><br>" +
    "Vs30 promedio <strong>" + mediaVs30.toFixed(2) + " m/s</strong><br>" +
    "Gmax promedio <strong>" + formatearNumero(mediaGmax) + "</strong>";
}

function formatearNumero(valor) {
  return valor.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

function capitalizar(texto) {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function inicializarGrafica() {
  const ctx = document.getElementById("graficaVs30");

  graficaVs30 = new Chart(ctx, {
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
          suggestedMax: 420,
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

document.getElementById("suelo").addEventListener("change", actualizarGrafica);

document.getElementById("normativa").addEventListener("change", () => {
  actualizarGrafica();
});

inicializarGrafica();
cargarSondeos();
