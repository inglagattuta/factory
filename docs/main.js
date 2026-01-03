const mapEl = document.getElementById("map");
const logEl = document.getElementById("log");
const statusEl = document.getElementById("status");

const SETTINGS = {
  easy: { size: 5, bombs: 4, food: 5 },
  normal: { size: 6, bombs: 7, food: 6 },
  hard: { size: 7, bombs: 12, food: 7 }
};

let SIZE = 0;
let state = null;

// ================== START GAME ==================
function startGame(level) {
  const cfg = SETTINGS[level];
  SIZE = cfg.size;

  state = {
    population: 3,
    foodLeft: cfg.food,
    gameOver: false,
    map: []
  };

  mapEl.innerHTML = "";
  mapEl.style.gridTemplateColumns = `repeat(${SIZE}, 40px)`;
  logEl.textContent = "";

  createMap(cfg);
  renderStatus();
  render();

  log(`🎮 Livello ${level.toUpperCase()} avviato`);
}

// ================== MAP ==================
function createMap(cfg) {
  const total = SIZE * SIZE;
  const cells = Array(total).fill("empty");

  placeRandom(cells, "bomb", cfg.bombs);
  placeRandom(cells, "food", cfg.food);

  state.map = [];

  for (let i = 0; i < total; i++) {
    state.map.push({
      type: cells[i],
      revealed: false,
      bombs: 0,
      food: 0
    });
  }

  calculateHints();
}

function placeRandom(arr, type, count) {
  let placed = 0;
  while (placed < count) {
    const i = Math.floor(Math.random() * arr.length);
    if (arr[i] === "empty") {
      arr[i] = type;
      placed++;
    }
  }
}

function calculateHints() {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = y * SIZE + x;
      const cell = state.map[idx];

      neighbors(x, y).forEach(n => {
        if (state.map[n].type === "bomb") cell.bombs++;
        if (state.map[n].type === "food") cell.food++;
      });
    }
  }
}

function neighbors(x, y) {
  const res = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;

      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE) {
        res.push(ny * SIZE + nx);
      }
    }
  }
  return res;
}

// ================== RENDER ==================
function render() {
  mapEl.innerHTML = "";

  state.map.forEach((cell, i) => {
    const div = document.createElement("div");
    div.className = "cell " + (cell.revealed ? "revealed" : "hidden");

    if (cell.revealed) {
      if (cell.type === "bomb") div.textContent = "💣";
      else if (cell.type === "food") div.textContent = "🍎";
      else div.textContent = `${cell.bombs}-${cell.food}`;
    }

    div.onclick = () => reveal(i);
    mapEl.appendChild(div);
  });
}

function renderStatus() {
  statusEl.textContent =
    `👥 Popolazione: ${state.population} | 🍎 Cibo rimasto: ${state.foodLeft}`;
}

// ================== GAMEPLAY ==================
function reveal(i) {
  if (state.gameOver) return;

  const cell = state.map[i];
  if (cell.revealed) return;

  cell.revealed = true;

  if (cell.type === "bomb") {
    state.population--;
    log("💥 Bomba! Popolazione -1");
  }

  if (cell.type === "food") {
    state.population++;
    state.foodLeft--;
    log("🍎 Cibo trovato! Popolazione +1");
  }

  if (state.population <= 0) {
    endGame("💀 Popolazione azzerata. Hai perso.");
    return;
  }

  if (state.foodLeft === 0) {
    endGame("🏆 Hai raccolto tutto il cibo! Vittoria!");
    return;
  }

  renderStatus();
  render();
}

function endGame(msg) {
  state.gameOver = true;
  render();
  log(msg);
}

// ================== LOG ==================
function log(msg) {
  logEl.textContent += msg + "\n";
  logEl.scrollTop = logEl.scrollHeight;
}
// Rendi startGame visibile all'HTML
window.startGame = startGame;
