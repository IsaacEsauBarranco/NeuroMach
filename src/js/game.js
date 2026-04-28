let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let gameStarted = false;

//Variables para el cronometro
let time = 90; // segundos (1:30)
let timerInterval = null;

//Variables de sonido
const correctSound = new Audio("sounds/correcto.mp3");
const errorSound = new Audio("sounds/error.mp3");
errorSound.volume = 0.2;

const errorClone = errorSound.cloneNode();
errorClone.volume = errorSound.volume;
errorClone.play();

// Valores base (10 pares = 20 cartas)
const values = [
    "images/avion2.png",
    "images/balon2.png",
    "images/cohete2.png",
    "images/control2.png",
    "images/corazon2.png",
    "images/guitarra2.png",
    "images/helado2.png",
    "images/lobo2.png",
    "images/planeta2.png",
    "images/taco2.png"
];

// Duplicar para crear pares
let cards = [...values, ...values];

// Convertir a objetos (modelo real)
cards = cards.map((value, index) => ({
    id: index,
    value: value,
    flipped: false,
    matched: false
}));

console.log(cards);

//Revolver cartas
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

shuffle(cards);

console.log("Mezcladas:", cards);

/* 
Carta Escrita directa en HTML
<div class="w-28 h-28 bg-white rounded-2xl shadow-md flex items-center justify-center text-orange-300 text-2xl font-bold cursor-pointer hover:scale-105 hover:bg-orange-100 transition duration-200">?</div>
*/

const board = document.getElementById("board");

// ACTUALIZAR MOVIMIENTOS
function updateMoves() {
    document.getElementById("moves").textContent = moves;
}

function renderBoard() {
    board.innerHTML = "";

    cards.forEach(card => {
        const cardElement = document.createElement("div");

        cardElement.className = `
            w-28 h-28 bg-white rounded-2xl shadow-md
            flex items-center justify-center
            text-orange-300 text-2xl font-bold
            ${gameStarted ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
            hover:scale-105 hover:bg-orange-100
            transition duration-200
        `;

        // Mostrar contenido
        if (card.flipped || card.matched) {
            const img = document.createElement("img");
            img.src = card.value;
            img.className = "w-16 h-16 object-contain";

            cardElement.innerHTML = "";
            cardElement.appendChild(img);

            cardElement.classList.add("bg-orange-500");
        } else {
            cardElement.textContent = "?";
        }

        cardElement.addEventListener("click", () => handleCardClick(card));

        board.appendChild(cardElement);
    });
}

// FUNCION PRINCIPAL DE CLICK
function handleCardClick(card) {
    if (!gameStarted) return;

    // Evitar errores
    if (lockBoard) return;
    if (card.flipped || card.matched) return;

    // Voltear carta
    card.flipped = true;

    // Guardar selección
    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card;
        lockBoard = true;

        // SUMAR MOVIMIENTO 
        moves++;
        updateMoves();

        checkMatch();
    }

    renderBoard();
}

// COMPARAR CARTAS
function updatePairs() {
    const matchedCards = cards.filter(card => card.matched).length;
    const pairs = matchedCards / 2;

    document.getElementById("pairs").textContent = `${pairs}/10`;
}

function checkMatch() {
    if (firstCard.value === secondCard.value) {
        // SONIDO CORRECTO
        correctSound.currentTime = 0;
        correctSound.play();

        // SON IGUALES
        firstCard.matched = true;
        secondCard.matched = true;

        updatePairs();

        const allMatched = cards.every(card => card.matched);

        if (allMatched) {
            endGame(true); // victoria
            return;
        }

        resetTurn();
    } else {
        // 🔊 SONIDO ERROR (pro)
        const errorClone = errorSound.cloneNode();
        errorClone.volume = errorSound.volume;
        errorClone.play();

        setTimeout(() => {
            firstCard.flipped = false;
            secondCard.flipped = false;

            resetTurn();
            renderBoard();
        }, 800);

        // NO SON IGUALES
        setTimeout(() => {
            firstCard.flipped = false;
            secondCard.flipped = false;

            resetTurn();
            renderBoard();
        }, 800);
    }
}


// RESET DE TURNO
function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

// Render inicial
renderBoard();

updateMoves();
updatePairs();

function resetGame(shuffleCards = true) {
    // Reset estado
    firstCard = null;
    secondCard = null;
    lockBoard = false;

    moves = 0;

    // Reset cartas
    cards.forEach(card => {
        card.flipped = false;
        card.matched = false;
    });

    // Mezclar si se pide
    if (shuffleCards) {
        shuffle(cards);
    }

    // Reset tiempo
    resetTimer();

    // UI
    updateMoves();
    updatePairs();
    renderBoard();
}

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

//BotonComenzar
startBtn.addEventListener("click", () => {
    gameStarted = true;
    resetGame(true);
    startTimer(); 
});

//BotonResetear
restartBtn.addEventListener("click", () => {
    gameStarted = false;
    resetGame(false);
});

// Colocar tiempo en minutos y segundos
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function updateTimer() {
    document.getElementById("timer").textContent = formatTime(time);
}

//Iniciar cronometro
function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        time--;
        updateTimer();

        if (time <= 0) {
            endGame(false); // derrota
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    time = 90;
    updateTimer();
}

// FUNCION FINAL DEL JUEGO (VICTORIA / DERROTA)
function endGame(win) {
    clearInterval(timerInterval);
    lockBoard = true;

    // Calcular tiempo usado
    const timeTaken = 90 - time;

    // Guardar datos
    localStorage.setItem("finalTime", formatTime(timeTaken));
    localStorage.setItem("finalMoves", moves);

    // Redirección
    if (win) {
        window.location.href = "victory.html";
    } else {
        window.location.href = "defeat.html";
    }
}