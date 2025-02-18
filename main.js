const start = document.getElementById('start');
const configuration = document.getElementById('configuration');
const game = document.getElementById('game');
const end = document.getElementById('end');
const classicModeBtn = document.getElementById('classic-mode');
const startGameBtn = document.getElementById('start-game');
const submitWordBtn = document.getElementById('submit-word');
const skipTurnBtn = document.getElementById('skip-turn');
const wordInput = document.getElementById('word-input');
const timeLeft = document.getElementById('time-left');
const currentPlayer = document.getElementById('current-player');
const leaderboard = document.getElementById('leaderboard');
const restartBtn = document.getElementById('restart');
const playersConfig = document.getElementById('players-config');
const playerInput = document.getElementById('player-input');

let players = [];
let currentTurn = 0;
let words = {};
let time = 60;
let interval;
let currentLetter = '';


classicModeBtn.addEventListener('click', () => {
    start.style.display = 'none';
    configuration.style.display = 'block';
    generatePlayerInputs();
});

startGameBtn.addEventListener('click', () => {
    if (startGame()) {
        configuration.style.display = 'none';
        game.style.display = 'block';
    }
});

restartBtn.addEventListener('click', () => {
    end.style.display = 'none';
    start.style.display = 'block';
    resetGame();
});

submitWordBtn.addEventListener('click', function () {
    let word = wordInput.value.trim().toLowerCase();
    let currentPlayerName = players[currentTurn].name;
    let playerWords = words[currentPlayerName];

    if (word === "") {
        alert("Debes ingresar una palabra.");
        return;
    }

    if (word.includes(" ")) {
        alert("No puedes ingresar más de una palabra.");
        return;
    }

    let firstLetter = word.charAt(0);
    if (firstLetter !== currentLetter) {
        alert('La palabra debe comenzar con la letra "' + currentLetter.toUpperCase() + '"');
        return;
    }

    let repeatedWord = false;
    for (let i = 0; i < playerWords.length; i++) {
        if (playerWords[i] === word) {
            repeatedWord = true;
            break;
        }
    }

    if (repeatedWord) {
        alert("¡Palabra repetida!");
        return;
    }

    playerWords.push(word);
    wordInput.value = "";
});

skipTurnBtn.addEventListener('click', () => {
    nextTurn();
});

function generatePlayerInputs() {
    playersConfig.innerHTML = '';
    for (let i = 1; i <= 4; i++) {
        playersConfig.innerHTML += `
                <div>
                    <h3>Jugador ${i}</h3>
                    <input type="text" id="player-name-${i}" placeholder="Nombre del Jugador ${i}">
                </div>
            `;
    }
}

function startGame() {
    players = [];
    for (let i = 1; i <= 4; i++) {
        const name = document.getElementById(`player-name-${i}`).value.trim();
        if (name) {
            players.push({ name });
        }
    }
    if (players.length < 2) {
        alert("Debe haber al menos 2 jugadores para comenzar el juego.");
        return false;
    }

    words = {};
    for (let i = 0; i < players.length; i++) {
        words[players[i].name] = [];
    }

    currentTurn = 0;
    time = 60;
    currentLetter = generateRandomLetter();
    updateTurn();
    interval = setInterval(updateTime, 1000);
    return true;
}

function resetGame() {
    clearInterval(interval);
    timeLeft.textContent = '';
    leaderboard.innerHTML = '';
}

function updateTurn() {
    currentPlayer.textContent = `Turno de ${players[currentTurn].name} (Letra: ${currentLetter.toUpperCase()})`;
    playerInput.style.display = 'block';
}

function updateTime() {
    timeLeft.textContent = `Tiempo restante: ${time} segundos`;
    if (time <= 0) {
        clearInterval(interval);
        nextTurn();
    } else {
        time--;
    }
}

function nextTurn() {
    currentTurn = currentTurn + 1;

    if (currentTurn >= players.length) {
        currentTurn = 0;
        endGame();
        return;
    }

    time = 60;
    currentLetter = generateRandomLetter();
    updateTurn();
    clearInterval(interval);
    interval = setInterval(updateTime, 1000);
}

function endGame() {
    game.style.display = 'none';
    end.style.display = 'block';
    showRanking();
}

function generateRandomLetter() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    return letters[Math.floor(Math.random() * letters.length)];
}

function sortPlayers(players, words) {
    let sortedPlayers = [];
    let playersCopy = [...players];

    while (playersCopy.length > 0) {
        let maxIndex = 0;
        let maxWords = 0;

        for (let i = 0; i < playersCopy.length; i++) {
            let currentWords = 0;

            if (words[playersCopy[i].name] !== undefined) {
                currentWords = words[playersCopy[i].name].length;
            }

            if (currentWords > maxWords) {
                maxIndex = i;
                maxWords = currentWords;
            }
        }

        sortedPlayers.push(playersCopy[maxIndex]);

        let newList = [];
        for (let i = 0; i < playersCopy.length; i++) {
            if (i !== maxIndex) {
                newList.push(playersCopy[i]);
            }
        }
        playersCopy = newList;
    }

    return sortedPlayers;
}

function generateLeaderboardHTML(sortedPlayers, words) {
    let html = "";

    for (let i = 0; i < sortedPlayers.length; i++) {
        let player = sortedPlayers[i];
        let playerWords = [];
        let wordsList = "";

        if (words[player.name] !== undefined) {
            playerWords = words[player.name];
        }

        if (playerWords.length > 0) {
            for (let j = 0; j < playerWords.length; j++) {
                wordsList += `<div class="word-chip">${playerWords[j]}</div>`;
            }
        } else {
            wordsList = '<p class="no-words">No ingresó palabras</p>';
        }

        html += `
                <div class="card">
                    <div class="card-header">
                        <h3>${player.name}</h3>
                        <p>${playerWords.length} palabras • Posición ${i + 1}</p>
                    </div>
                    <div class="words-grid">
                        ${wordsList}
                    </div>
                </div>
            `;
    }
    return html;
}

wordInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        submitWordBtn.click(); 
    }
});


function showRanking() {
    let sortedPlayers = sortPlayers(players, words);
    leaderboard.innerHTML = generateLeaderboardHTML(sortedPlayers, words);
}
