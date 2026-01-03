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
  population: 3,
  foodLeft: FOOD,
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
function createCell() {
  return {
    bomb: false,
    food: false,
    revealed: false,
    adjBombs: 0,
    adjFood: 0
  };
}

function createMap() {
  for (let y = 0; y < SIZE; y++) {
    state.map[y] = [];
    for (let x = 0; x < SIZE; x++) {
      state.map[y][x] = createCell();
    }
  }

  placeRandom("bomb", BOMBS);
  placeRandom("food", FOOD);

  // start sicuro
  const { x, y } = state.player;
  state.map[y][x].bomb = false;
  state.map[y][x].food = false;

  calculateAdjacents();
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
// ADJACENT COUNTS
// ===============================
function calculateAdjacents() {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let bombs = 0;
      let food = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;

          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE) {
            if (state.map[ny][nx].bomb) bombs++;
            if (state.map[ny][nx].food) food++;
          }
        }
      }

      state.map[y][x].adjBombs = bombs;
      state.map[y][x].adjFood = food;
    }
  }
}

// ===============================
// REVEAL
// ===============================
function reveal(x, y) {
  const cell = state.map[y][x];
  if (cell.revealed || state.gameOver) return;

  cell.revealed = true;

  if (cell.food) {
    state.population++;
    state.foodLeft--;
    cell.food = false;
    log("🌾 Cibo trovato! Popolazione +1");
  }

  if (cell.bomb) {
    state.population--;
    log("💣 Bomba! Popolazione -1");
  }

  if (state.population <= 0) {
    state.gameOver = true;
    log("💀 GAME OVER");
  }

  if (state.foodLeft === 0) {
    state.gameOver = true;
    log("🏆 VITTORIA! Tutto il cibo raccolto");
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

  reveal(nx, ny);
  render();
}

// ===============================
// RENDER
// ===============================
function render() {
  statusEl.textContent =
    `Popolazione: ${state.population} | Cibo rimasto: ${state.foodLeft}`;

  mapEl.innerHTML = "";

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const el = document.createElement("div");
      el.className = "cell";

      const cell = state.map[y][x];

      if (state.player.x === x && state.player.y === y) {
        el.textContent = "🧭";
      } else if (!cell.revealed) {
        el.textContent = "?";
        el.classList.add("hidden");
      } else if (cell.bomb) {
        el.textContent = "💣";
      } else {
        el.textContent = `${cell.adjBombs}-${cell.adjFood}`;
      }

      mapEl.appendChild(el);
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
log("Indizi: BOMBE-CIBO");
