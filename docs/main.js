// ===============================
// GAME STATE
// ===============================
const SIZE = 5;
const BOMBS = 5;
const FOOD = 5;

const state = {
  turn: 0,
  resources: {
    food: 5,
    stability: 5,
    population: 3
  },
  gameOver: false,
  map: [],
  player: { x: 2, y: 2 }
};

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
// MAP CREATION (MINESWEEPER STYLE)
// ===============================
function createEmptyCell() {
  return {
    bomb: false,
    food: false,
    revealed: false
  };
}

function createMap() {
  // crea griglia vuota
  for (let y = 0; y < SIZE; y++) {
    state.map[y] = [];
    for (let x = 0; x < SIZE; x++) {
      state.map[y][x] = createEmptyCell();
    }
  }

  placeRandom("bomb", BOMBS);
  placeRandom("food", FOOD);

  // cella iniziale sempre sicura
  const start = state.player;
  state.map[start.y][start.x].bomb = false;

  reveal(start.x, start.y);
}

function placeRandom(type, count) {
  let placed = 0;
  while (placed < count) {
    const x = Math.floor(Math.random() * SIZE);
    const y = Math.floor(Math.random() * SIZE);

    const cell = state.map[y][x];
    if (!cell[type] && !(x === state.player.x && y === state.player.y)) {
      cell[type] = true;
      placed++;
    }
  }
}

function reveal(x, y) {
  const cell = state.map[y][x];
  if (cell.revealed) return;

  cell.revealed = true;

  if (cell.food) {
    state.resources.food += 2;
    log("🌾 Trovato cibo (+2)");
    cell.food = false;
  }

  if (cell.bomb) {
    state.resources.stability -= 2;
    log("💣 Zona pericolosa! (-2 stabilità)");
  }
}

// ===============================
// MOVEMENT
// ===============================
function move(dx, dy) {
  const nx = state.player.x + dx;
  const ny = state.player.y + dy;

  if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE) return;
  if (state.gameOver) return;

  state.player.x = nx;
  state.player.y = ny;

  state.turn++;
  state.resources.food -= state.resources.population;

  reveal(nx, ny);
  render();

  if (state.resources.food < 0) {
    state.resources.population--;
    state.resources.food = 0;
    log("⚠ Fame! Popolazione diminuita");
  }

  if (state.resources.population <= 0 || state.resources.stability <= 0) {
    state.gameOver = true;
    log("💀 GAME OVER");
  }
}

// ===============================
// RENDER
// ===============================
function render() {
  statusEl.textContent =
    `Turno ${state.turn} | ` +
    `Food: ${state.resources.food} | ` +
    `Stability: ${state.resources.stability} | ` +
    `Pop: ${state.resources.population}`;

  mapEl.innerHTML = "";

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      if (state.player.x === x && state.player.y === y) {
        cell.textContent = "👑";
      } else if (!state.map[y][x].revealed) {
        cell.textContent = "?";
        cell.classList.add("hidden");
      } else if (state.map[y][x].bomb) {
        cell.textContent = "💣";
      } else {
        cell.textContent = ".";
      }

      mapEl.appendChild(cell);
    }
  }
}

// ===============================
// INPUT
// ===============================
window.addEventListener("keydown", e => {
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
