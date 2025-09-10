
const OPCIONES = ["piedra", "papel", "tijeras"];

let marcador = { victorias: 0, derrotas: 0, empates: 0 };

// constantes para los elementos del html utilizados

const elCpu = $("#cpu-eleccion");
const elResultado = $("#resultado");
const elVC = $("#v-count");
const elDC = $("#d-count");
const elEC = $("#e-count");
const btnReiniciar = $("#reiniciar");

function renderizarMarcador() {
  elVC.textContent = marcador.victorias;
  elDC.textContent = marcador.derrotas;
  elEC.textContent = marcador.empates;
}

function renderizarCPU(eleccion) { elCpu.textContent = eleccion; }

function renderizarResultado(mensaje) { elResultado.textContent = mensaje; }

function calcularResultado(jugador, computadora) {
  if (jugador === computadora) return "empate";
  const gana =
    (jugador === "piedra" && computadora === "tijeras") ||
    (jugador === "papel" && computadora === "piedra") ||
    (jugador === "tijeras" && computadora === "papel");
  return gana ? "victoria" : "derrota";
}

function mostrarResultado(jugador, computadora) {
  const r = calcularResultado(jugador, computadora);
  if (r === "empate") {
    marcador.empates++;
    renderizarResultado("¡Empate!");
  } else if (r === "victoria") {
    marcador.victorias++;
    renderizarResultado("¡Ganaste la ronda! 🎉");
  } else {
    marcador.derrotas++;
    renderizarResultado("¡Mala suerte! Perdiste esta ronda.");
  }
  renderizarCPU(computadora);
  renderizarMarcador();
}

// función para el onclick en el html
function jugar(eleccionJugador) {
  const i = Math.floor(Math.random() * OPCIONES.length);
  const eleccionComputadora = OPCIONES[i];
  mostrarResultado(eleccionJugador, eleccionComputadora);
}
window.jugar = jugar;

// volver al estado inicial
btnReiniciar.addEventListener("click", () => {
  marcador = { victorias: 0, derrotas: 0, empates: 0 };
  renderizarCPU("—");
  renderizarResultado("Marcador reiniciado");
  renderizarMarcador();
});

// mostrar estado inicial
renderizarMarcador();
renderizarResultado("Seleccioná un movimiento para empezar a jugar");

