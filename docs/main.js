// ===============================
// CONFIG
// ===============================
const SIZE = 5;
const BOMBS = 5;
const FOOD = 5;

// ===============================
// GAME STATE
// ===============================
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
function createEmptyCell() {
  return {
    bomb: false,
    food: false,
    revealed: false,
    danger: 0
  };
}

function createMap() {
  // griglia vuota
  for (let y = 0; y < SIZE; y++) {
    state.map[y] = [];
    for (let x = 0; x < SIZE; x++) {
      state.map[y][x] = createEmptyCell();
    }
  }

  placeRandom("bomb", BOMBS);
  placeRandom("food", FOOD);

  // start sempre sicuro
  const { x, y } = state.player;
  state.map[y][x].bomb = false;

  calculateDanger();
  reveal(x, y);
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

// ===============================
// DANGER CALCULATION
// ===============================
function calculateDanger() {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let count = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;

          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE) {
            if (state.map[ny][nx].bomb) count++;
          }
        }
      }

      state.map[y][x].danger = count;
    }
  }
}

// ===============================
// REVEAL
// ===============================
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
  if (state.gameOver) return;

  const nx = state.player.x + dx;
  const ny = state.player.y + dy;

  if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE) return;

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
    `Turno ${state.turn} | Food: ${state.resources.food} | ` +
    `Stability: ${state.resources.stability} | Pop: ${state.resources.population}`;

  mapEl.innerHTML = "";

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const data = state.map[y][x];

      if (state.player.x === x && state.player.y === y) {
        cell.textContent = "👑";
      } else if (!data.revealed) {
        cell.textContent = "?";
        cell.classList.add("hidden");
      } else if (data.bomb) {
        cell.textContent = "💣";
      } else if (data.danger > 0) {
        cell.textContent = data.danger;
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
log("Numeri = bombe adiacenti");
log("Usa ↑ ↓ ← → per muoverti");
