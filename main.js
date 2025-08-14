const OPCIONES = ["piedra", "papel", "tijeras"]

let marcador = {
    victorias: 0,
    derrotas: 0,
    empates: 0
};

function mostrarResultado(jugador, computadora) {
    if (jugador === computadora) {
        alert("¡Empate!");
        marcador.empates++;
    } else if ((jugador === "piedra" && computadora === "tijeras") || (jugador === "papel" && computadora === "piedra") || (jugador === "tijeras" && computadora === "papel")) {
        alert("¡Ganaste la ronda!");
        marcador.victorias++;
    } else {
        alert("¡Mala suerte! Perdiste esta ronda.");
        marcador.derrotas++;
   }
}

function main() {         
    let entrada;                   

    while (true) {
        entrada = prompt("Introduzca el movimiento a jugar (piedra, papel, tijeras):");

        if (entrada === null || entrada === "") {
            break; // corta el ciclo
        }

        if (!OPCIONES.includes(entrada)) {
            alert("Opción inválida. Intente nuevamente.");
            continue; // vuelve al inicio del loop
        }

        let indiceComputadora = Math.floor(Math.random() * OPCIONES.length);
        let jugadaComputadora = OPCIONES[indiceComputadora];
        alert(`La computadora eligió: ${jugadaComputadora}`);

        mostrarResultado(entrada, jugadaComputadora);
    }

    alert(`¡Juego terminado!\nVictorias: ${marcador.victorias}\nDerrotas: ${marcador.derrotas}\nEmpates: ${marcador.empates}`);

}

main();