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
function agregarValorCalculado(vs30) {
  graficaVs30.data.labels.push("Calculado");
  graficaVs30.data.datasets[0].data.push(vs30.toFixed(2));
  graficaVs30.update();
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
    }) + " T/m³";
}

const datosSuelos = {
  granular: {
    etiqueta: "Vs30 - Suelo granular",
    labels: ["Sondeo 56", "Sondeo 62", "Sondeo 63", "Sondeo 64", "Sondeo 91"],
    datos: [295, 305, 315, 300, 310],
    color: "rgba(67, 160, 71, 0.6)"
  },
  cohesivo: {
    etiqueta: "Vs30 - Suelo cohesivo",
    labels: ["Sondeo 205", "Sondeo 207", "Sondeo 208", "Sondeo 209", "Sondeo 300"],
    datos: [240, 255, 265, 250, 260],
    color: "rgba(251, 140, 0, 0.6)"
  },
  noclasificado: {
    etiqueta: "Vs30 - Zona no clasificada",
    labels: ["Sondeo 418", "Sondeo 419", "Sondeo 420"],
    datos: [270, 275, 268],
    color: "rgba(120, 120, 120, 0.6)"
  }
};

const ctx = document.getElementById("graficaVs30");

let graficaVs30 = new Chart(ctx, {
  type: "bar",
  data: {
    labels: datosSuelos.granular.labels,
    datasets: [{
      label: datosSuelos.granular.etiqueta,
      data: datosSuelos.granular.datos,
      backgroundColor: datosSuelos.granular.color
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

function actualizarGrafica() {
  let tipo = document.getElementById("suelo").value;
  let datos = datosSuelos[tipo];

  graficaVs30.data.labels = datos.labels;
  graficaVs30.data.datasets[0].label = datos.etiqueta;
  graficaVs30.data.datasets[0].data = datos.datos;
  graficaVs30.data.datasets[0].backgroundColor = datos.color;

  graficaVs30.update();
}
