// ===============================
// GAME STATE
// ===============================
const state = {
  turn: 0,
  resources: {
    gold: 5,
    food: 5,
    stability: 5,
    population: 3
  },
  gameOver: false,
  map: [],
  visible: []
};

const SIZE = 5;

// ===============================
// UI
// ===============================
const statusEl = document.getElementById("status");
const logEl = document.getElementById("log");
const mapEl = document.getElementById("map");
const buttons = document.querySelectorAll("button");

// ===============================
// LOG
// ===============================
function log(text) {
  logEl.textContent += text + "\n";
  logEl.scrollTop = logEl.scrollHeight;
}

// ===============================
// MAP
// ===============================
function createMap() {
  const symbols = [".", ".", ".", "🌾", "⚔"];

  for (let y = 0; y < SIZE; y++) {
    state.map[y] = [];
    state.visible[y] = [];
    for (let x = 0; x < SIZE; x++) {
      state.map[y][x] =
        symbols[Math.floor(Math.random() * symbols.length)];
      state.visible[y][x] = false;
    }
  }

  // centro visibile
  state.visible[2][2] = true;
}

function renderMap() {
  mapEl.innerHTML = "";
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      if (!state.visible[y][x]) {
        cell.classList.add("hidden");
        cell.textContent = "?";
      } else {
        cell.textContent = state.map[y][x];
      }

      mapEl.appendChild(cell);
    }
  }
}

// ===============================
// ACTIONS
// ===============================
function applyAction(action) {
  if (action === "GATHER") {
    state.resources.food += 2;
  }

  if (action === "BUILD" && state.resources.gold >= 2) {
    state.resources.gold -= 2;
    state.resources.stability += 1;
  }

  if (action === "EXPLORE") {
    revealRandomCell();
  }
}

function revealRandomCell() {
  const hidden = [];

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (!state.visible[y][x]) hidden.push({ x, y });
    }
  }

  if (hidden.length === 0) {
    log("🗺 Tutta la mappa è esplorata");
    return;
  }

  const cell = hidden[Math.floor(Math.random() * hidden.length)];
  state.visible[cell.y][cell.x] = true;

  const content = state.map[cell.y][cell.x];
  log(`🧭 Esplorato: ${content}`);

  if (content === "🌾") state.resources.food += 2;
  if (content === "⚔") state.resources.stability -= 1;
}

// ===============================
// TURN ENGINE
// ===============================
function nextTurn() {
  state.turn++;

  state.resources.food -= state.resources.population;

  if (state.resources.food < 0) {
    state.resources.population--;
    state.resources.food = 0;
    log("⚠ Fame! Popolazione diminuita");
  }

  if (state.resources.population <= 0) {
    state.gameOver = true;
  }
}

// ===============================
// RENDER
// ===============================
function render() {
  statusEl.textContent =
    `Turno ${state.turn} | ` +
    `Gold: ${state.resources.gold} | ` +
    `Food: ${state.resources.food} | ` +
    `Stability: ${state.resources.stability} | ` +
    `Pop: ${state.resources.population}`;

  renderMap();
}

// ===============================
// EVENTS
// ===============================
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (state.gameOver) return;

    const action = btn.dataset.action;
    log(`➡ Azione: ${action}`);

    applyAction(action);
    nextTurn();
    render();

    if (state.gameOver) {
      log("💀 GAME OVER");
    }
  });
});

// ===============================
// INIT
// ===============================
createMap();
render();
log("🏁 Inizio partita");
