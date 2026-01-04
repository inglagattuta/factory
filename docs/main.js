// ================== DOM ==================
const mapEl = document.getElementById("map");
const logEl = document.getElementById("log");
const statusEl = document.getElementById("status");

// ================== SETTINGS ==================
const SETTINGS = {
  easy:    { size: 5,  bombs: 4,  food: 5 },
  normal:  { size: 6,  bombs: 7,  food: 6 },
  hard:    { size: 7,  bombs: 12, food: 7 },
  extreme: { size: 10, bombs: 30, food: 8 }
};

// ================== STATE ==================
let SIZE = 0;
let state = null;

let arcadeMode = false;
let arcadeLevel = 1;

// ================== ARCADE CONFIG ==================
function getArcadeConfig(level) {
  const size = Math.min(4 + Math.floor(level / 5), 25);
  const total = size * size;

  return {
    size,
    bombs: Math.floor(total * 0.18),
    food: Math.max(3, Math.floor(total * 0.08))
  };
}

// ================== START GAME ==================
function startGame(level) {
  arcadeMode = false;

  const cfg = SETTINGS[level];
  if (!cfg) {
    alert("Livello non valido: " + level);
    return;
  }

  SIZE = cfg.size;

  state = {
    population: 3,
    foodLeft: cfg.food,
    gameOver: false,
    map: []
  };

  setupGrid();
  logEl.textContent = "";

  createMap(cfg);
  renderStatus();
  render();

  log(`🎮 Livello ${level.toUpperCase()} avviato`);
}

// ================== START ARCADE ==================
function startArcade() {
  arcadeMode = true;
  arcadeLevel = 1;

  state = {
    population: 3,
    foodLeft: 0,
    gameOver: false,
    map: []
  };

  startArcadeLevel();
}

function startArcadeLevel() {
  const cfg = getArcadeConfig(arcadeLevel);

  SIZE = cfg.size;
  state.foodLeft = cfg.food;
  state.gameOver = false;
  state.map = [];

  setupGrid();
  logEl.textContent = "";

  createMap(cfg);
  renderStatus();
  render();

  log(`🕹️ ARCADE – Livello ${arcadeLevel}`);
}

// ================== GRID ==================
function setupGrid() {
  mapEl.innerHTML = "";
  const cellSize = SIZE >= 10 ? 28 : 36;
  mapEl.style.gridTemplateColumns = `repeat(${SIZE}, ${cellSize}px)`;
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
      flagged: false,
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

    if (cell.flagged && !cell.revealed) {
      div.textContent = "🚩";
    }

    if (cell.revealed) {
      if (cell.type === "bomb") div.textContent = "💣";
      else if (cell.type === "food") div.textContent = "🍎";
      else div.textContent = `${cell.bombs}-${cell.food}`;
    }

    div.onclick = () => reveal(i);

    div.oncontextmenu = (e) => {
      e.preventDefault();
      if (cell.revealed || state.gameOver) return;
      cell.flagged = !cell.flagged;
      render();
    };

    mapEl.appendChild(div);
  });
}

function renderStatus() {
  statusEl.textContent =
    `👥 ${state.population} | 🍎 ${state.foodLeft}` +
    (arcadeMode ? ` | 🕹️ Lv ${arcadeLevel}` : "");
}

// ================== GAMEPLAY ==================
function reveal(i) {
  if (state.gameOver) return;

  const cell = state.map[i];
  if (cell.revealed || cell.flagged) return;

  if (cell.type === "empty" && cell.bombs === 0 && cell.food === 0) {
    autoReveal(i);
  } else {
    cell.revealed = true;
  }

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
    if (arcadeMode) {
      log(`✅ Livello ${arcadeLevel} completato`);
      arcadeLevel++;
      setTimeout(startArcadeLevel, 800);
    } else {
      endGame("🏆 Hai raccolto tutto il cibo! Vittoria!");
    }
    return;
  }

  renderStatus();
  render();
}

function autoReveal(index) {
  const stack = [index];

  while (stack.length) {
    const i = stack.pop();
    const cell = state.map[i];

    if (cell.revealed || cell.flagged || cell.type === "bomb") continue;
    cell.revealed = true;

    if (cell.bombs === 0 && cell.food === 0) {
      const x = i % SIZE;
      const y = Math.floor(i / SIZE);
      neighbors(x, y).forEach(n => stack.push(n));
    }
  }
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

// ================== EXPORT ==================
window.startGame = startGame;
window.startArcade = startArcade;
