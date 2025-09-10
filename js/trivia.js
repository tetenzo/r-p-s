
const RUTA_ARCHIVO_PREGUNTAS = '../data/preguntas.json';

// constantes para prolijidad en el mantenimiento al hacer uso de localstorage
const CLAVE_PREGUNTAS = 'trivia_preguntas';
const CLAVE_DIFICULTAD = 'trivia_dificultad';
const CLAVE_PUNTAJE = 'trivia_puntaje';
const CLAVE_TOPS = 'trivia_mejores_puntajes';
const CLAVE_HISTORIAL = 'trivia_historial';

// almacenamiento del estado del programa
let preguntas = [];
let indiceActual = 0;
let preguntaActual = null;

let puntaje = 0;
let segundosRestantes = 10;
let idTemporizador = null;
let respuestasBloqueadas = false;

let mejoresPuntajes = leerStorage(CLAVE_TOPS, []);
let historialRespuestas = leerStorage(CLAVE_HISTORIAL, []);

// constantes para elementos del DOM
const selectorDificultad = $('#difficulty');
const botonComenzar = $('#start');
const contenedorJuego = $('#play');
const textoPregunta = $('#q-text');
const contenedorOpciones = $('#q-options');
const textoPuntaje = $('#score');
const textoIndicePregunta = $('#q-index');
const textoTotalPreguntas = $('#q-total');
const textoTemporizador = $('#timer');
const textoFeedback = $('#feedback');
const botonSiguiente = $('#next');
const botonReiniciar = $('#restart');
const listaMejores = $('#highscores');
const listaHistorial = $('#history');


// para manejar el tiempo límite para responder
function establecerDificultadUI() {
  selectorDificultad.value = leerStorage(CLAVE_DIFICULTAD, 'facil');
}
function aplicarDificultad() {
  const nivel = selectorDificultad.value;
  guardarStorage(CLAVE_DIFICULTAD, nivel);
  segundosRestantes = (nivel === 'dificil') ? 5 : (nivel === 'medio') ? 7 : 10;
}


// por buenas prácticas, si se llegara a utilizar un json de formato inválido o no normalizado
function esPreguntaValida(p) {
  return p && typeof p.text === 'string' &&
    typeof p.correct === 'string' &&
    Array.isArray(p.options) && p.options.length >= 2;
}

function normalizarPregunta(p) {
  return {
    id: crypto.randomUUID(),
    text: p.text.trim(),
    correct: p.correct.trim(),
    options: p.options.map(o => String(o).trim())
  };
}

// procesa el json de preguntas y respuestas, maneja posibles errores o incompatibilidades para el programa
async function cargarBancoPreguntas(ruta) {
  try {
    const r = await fetch(ruta, { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const crudo = await r.json();
    if (!Array.isArray(crudo)) throw new Error('Formato inválido');
    return crudo.filter(esPreguntaValida).map(normalizarPregunta);
  } catch (e) {
    console.error('Error cargando preguntas:', e);
    return [];
  }
}

// funciones para mostrar los resultados en el html
function renderizarPuntaje() {
  textoPuntaje.textContent = puntaje;
}
function renderizarProgreso() {
  textoIndicePregunta.textContent = Math.min(indiceActual + 1, Math.max(preguntas.length, 1));
  textoTotalPreguntas.textContent = preguntas.length;
}
function renderizarMejoresPuntajes() {
  listaMejores.innerHTML = '';
  mejoresPuntajes
    .slice()
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, 10)
    .forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.puntaje} pts — ${new Date(item.fecha).toLocaleDateString('es-AR')}`;
      listaMejores.appendChild(li);
    });
}
function renderizarHistorial() {
  listaHistorial.innerHTML = '';
  historialRespuestas.slice(-10).reverse().forEach(h => {
    const li = document.createElement('li');
    const hora = new Date(h.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    li.textContent = `${hora}: ${h.texto} → ${h.eleccion} ${h.correcta ? '✓' : '✗'}`;
    listaHistorial.appendChild(li);
  });
}


// lógica y flujo principal del trivia
function crearBotonOpcion(opcion) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.textContent = opcion;
  boton.classList.add('jugada');
  boton.addEventListener('click', () => responder(opcion));
  return boton;
}

function renderizarOpciones(pregunta) {
  contenedorOpciones.innerHTML = '';
  mezclar(pregunta.options).forEach(opcion => {
    contenedorOpciones.appendChild(crearBotonOpcion(opcion));
  });
}

function iniciarTemporizador() {
  clearInterval(idTemporizador);
  let restante = segundosRestantes;
  textoTemporizador.textContent = restante;

  idTemporizador = setInterval(() => {
    restante -= 1;
    textoTemporizador.textContent = restante;

    if (restante <= 0) {
      clearInterval(idTemporizador);
      bloquearOpciones(false);
      textoFeedback.textContent = 'Tiempo agotado';
      botonSiguiente.disabled = false;
    }
  }, 1000);
}


function mostrarPregunta() {
  if (preguntas.length === 0) {
    textoPregunta.textContent = 'No hay preguntas.';
    contenedorOpciones.innerHTML = '';
    textoTemporizador.textContent = '-';
    botonSiguiente.disabled = true;
    return;
  }
  if (indiceActual >= preguntas.length) {
    finalizarJuego();
    return;
  }

  preguntaActual = preguntas[indiceActual];
  textoPregunta.textContent = preguntaActual.text;
  textoFeedback.textContent = '';
  respuestasBloqueadas = false;

  renderizarOpciones(preguntaActual);
  iniciarTemporizador();

  botonSiguiente.disabled = true;
  renderizarProgreso();
}

// para evaluar si la opción seleccionada es correcta
function bloquearOpciones(acerto) {
  respuestasBloqueadas = true;

  Array.from(contenedorOpciones.children).forEach(boton => {
    const esCorrecta = boton.textContent.trim().toLowerCase() ===
      preguntaActual.correct.trim().toLowerCase();
    if (acerto && esCorrecta) boton.style.background = '#87d493ff';
    boton.disabled = true;
  });
}

function responder(opcionElegida) {
  if (respuestasBloqueadas) return;

  const esCorrecta = opcionElegida.trim().toLowerCase() ===
    preguntaActual.correct.trim().toLowerCase();

  clearInterval(idTemporizador);
  bloquearOpciones(esCorrecta);

  textoFeedback.textContent = esCorrecta ? '¡Correcto! +1' : 'Incorrecto'; // operador ternario, esCorrecta = true -> muestra el resultado correspondiente
  if (esCorrecta) {
    puntaje += 1;
    guardarStorage(CLAVE_PUNTAJE, puntaje);
    renderizarPuntaje();
  }

  historialRespuestas.push({ // registro de resultados
    idPregunta: preguntaActual.id,
    texto: preguntaActual.text,
    eleccion: opcionElegida,
    correcta: esCorrecta,
    timestamp: Date.now()
  });

  guardarStorage(CLAVE_HISTORIAL, historialRespuestas);
  renderizarHistorial();

  botonSiguiente.disabled = false;
}

function finalizarJuego() {
  mejoresPuntajes.push({ puntaje, fecha: Date.now() });
  guardarStorage(CLAVE_TOPS, mejoresPuntajes);
  renderizarMejoresPuntajes();

  textoPregunta.textContent = `¡Fin! Puntaje: ${puntaje}`;
  contenedorOpciones.innerHTML = '';
  textoTemporizador.textContent = '-';
  botonSiguiente.disabled = true;
}



// comportamiento correspondiente a botones del juego
botonComenzar.addEventListener('click', async () => {
  aplicarDificultad();

  // al iniciar, lo primero que se hace luego de aplicar la dificultad es cargar y mezclar las preguntas y respuestas del json
  const banco = await cargarBancoPreguntas(RUTA_ARCHIVO_PREGUNTAS);
  preguntas = mezclar(banco);
  guardarStorage(CLAVE_PREGUNTAS, preguntas);

  puntaje = 0;
  guardarStorage(CLAVE_PUNTAJE, puntaje);
  indiceActual = 0;

  renderizarPuntaje(); // al reiniciar, se actualizan todos los valores mostrados
  renderizarProgreso();
  renderizarMejoresPuntajes();
  renderizarHistorial();

  contenedorJuego.hidden = false;
  mostrarPregunta();
});

selectorDificultad.addEventListener('change', aplicarDificultad);

botonSiguiente.addEventListener('click', () => {
  indiceActual += 1;
  mostrarPregunta();
});

botonReiniciar.addEventListener('click', async () => {
  const banco = await cargarBancoPreguntas(RUTA_ARCHIVO_PREGUNTAS);
  preguntas = mezclar(banco);
  guardarStorage(CLAVE_PREGUNTAS, preguntas);

  puntaje = 0;
  guardarStorage(CLAVE_PUNTAJE, puntaje);
  indiceActual = 0;

  renderizarPuntaje();
  renderizarProgreso();
  mostrarPregunta();
});

// función que se ejecuta al cargar el archivo, corresponde al estado inicial del juego, también muestra el historial guardado en localstorage
(() => {
  establecerDificultadUI();
  renderizarMejoresPuntajes();
  renderizarHistorial();
})();
