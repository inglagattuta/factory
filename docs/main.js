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
  visible: [],
  player: { x: 2, y: 2 }
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

  revealAroundPlayer();
}

function revealAroundPlayer() {
  const { x, y } = state.player;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE) {
        state.visible[ny][nx] = true;
      }
    }
  }
}

function renderMap() {
  mapEl.innerHTML = "";
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      if (state.player.x === x && state.player.y === y) {
        cell.textContent = "👑";
        cell.style.background = "#333";
      } else if (!state.visible[y][x]) {
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
    resolveTile();
  }
}

function resolveTile() {
  const { x, y } = state.player;
  const tile = state.map[y][x];

  log(`🧭 Esplori la casella: ${tile}`);

  if (tile === "🌾") state.resources.food += 2;
  if (tile === "⚔") state.resources.stability -= 1;

  state.map[y][x] = ".";
}

// ===============================
// MOVEMENT
// ===============================
function move(dx, dy) {
  const nx = state.player.x + dx;
  const ny = state.player.y + dy;

  if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE) return;

  state.player.x = nx;
  state.player.y = ny;

  revealAroundPlayer();
  log(`🚶 Spostato a (${nx},${ny})`);
  nextTurn();
  render();
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
// UI EVENTS
// ===============================
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (state.gameOver) return;

    const action = btn.dataset.action;
    log(`➡ Azione: ${action}`);
    applyAction(action);
    nextTurn();
    render();

    if (state.gameOver) log("💀 GAME OVER");
  });
});

// MOVIMENTO CON FRECCE
window.addEventListener("keydown", e => {
  if (state.gameOver) return;

  if (e.key === "ArrowUp") move(0, -1);
  if (e.key === "ArrowDown") move(0, 1);
  if (e.key === "ArrowLeft") move(-1, 0);
  if (e.key === "ArrowRight") move(1, 0);
});

// ===============================
// INIT
// ===============================
createMap();
render();
log("🏁 Inizio partita");
log("Usa ↑ ↓ ← → per muoverti");
