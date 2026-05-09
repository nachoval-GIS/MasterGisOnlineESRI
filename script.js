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

  let datosFiltrados = sondeos.filter(s => s.tipo === tipo);

  let labels = datosFiltrados.map(s => "Sondeo " + s.id);
  let valores = datosFiltrados.map(s => s.vs30);

  let colores = {
    granular: "rgba(67, 160, 71, 0.6)",
    cohesivo: "rgba(251, 140, 0, 0.6)",
    noclasificado: "rgba(120, 120, 120, 0.6)"
  };

  let etiquetas = {
    granular: "Vs30 - Suelo granular",
    cohesivo: "Vs30 - Suelo cohesivo",
    noclasificado: "Vs30 - Zona no clasificada"
  };

  graficaVs30.data.labels = labels;
  graficaVs30.data.datasets[0].label = etiquetas[tipo];
  graficaVs30.data.datasets[0].data = valores;
  graficaVs30.data.datasets[0].backgroundColor = colores[tipo];

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
  graficaVs30.data.labels.push("Calculado");
  graficaVs30.data.datasets[0].data.push(Number(vs30.toFixed(2)));
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
      backgroundColor: "rgba(67, 160, 71, 0.6)"
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Vs30 (m/s)"
        }
      }
    }
  }
});

cargarSondeos();
function obtenerColorVs30(vs30) {
  if (vs30 >= 800) {
    return "rgba(22, 163, 74, 0.85)";
  } else if (vs30 >= 360) {
    return "rgba(37, 99, 235, 0.85)";
  } else if (vs30 >= 180) {
    return "rgba(245, 158, 11, 0.85)";
  } else {
    return "rgba(220, 38, 38, 0.85)";
  }
}
