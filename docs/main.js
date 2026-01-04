// ================== DOM ==================
const mapEl = document.getElementById("map");
const logEl = document.getElementById("log");
const statusEl = document.getElementById("status");

// 🔥 blocca menu browser (necessario per right click)
mapEl.addEventListener("contextmenu", e => e.preventDefault());

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
let arcadeStartPopulation = 3;

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
  if (!cfg) return alert("Livello non valido");

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
  arcadeStartPopulation = 3;
  startArcadeLevel();
}

function startArcadeLevel() {
  const cfg = getArcadeConfig(arcadeLevel);
  SIZE = cfg.size;

  state = {
    population: arcadeStartPopulation,
    foodLeft: cfg.food,
    gameOver: false,
    map: []
  };

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
  mapEl.style.display = "grid";
  mapEl.style.justifyContent = "center";

  const cellSize =
    SIZE >= 14 ? 22 :
    SIZE >= 10 ? 26 :
    SIZE >= 8  ? 30 : 36;

  mapEl.style.gridTemplateColumns = `repeat(${SIZE}, ${cellSize}px)`;
  mapEl.style.gridAutoRows = `${cellSize}px`;
}

// ================== MAP ==================
function createMap(cfg) {
  const total = SIZE * SIZE;
  const cells = Array(total).fill("empty");

  placeRandom(cells, "bomb", cfg.bombs);
  placeRandom(cells, "food", cfg.food);

  state.map = cells.map(type => ({
    type,
    revealed: false,
    flagged: false,
    bombs: 0,
    food: 0
  }));

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
      neighbors(x, y).forEach(n => {
        if (state.map[n].type === "bomb") state.map[idx].bombs++;
        if (state.map[n].type === "food") state.map[idx].food++;
      });
    }
  }
}

function neighbors(x, y) {
  const res = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE)
        res.push(ny * SIZE + nx);
    }
  }
  return res;
}

// ================== RENDER ==================
function render() {
  mapEl.innerHTML = "";

  state.map.forEach((cell, i) => {
    const div = document.createElement("div");
    div.className = `cell ${cell.revealed ? "revealed" : "hidden"}`;

    if (cell.flagged && !cell.revealed) div.textContent = "🚩";
    if (cell.revealed) {
      if (cell.type === "bomb") div.textContent = "💣";
      else if (cell.type === "food") div.textContent = "🍎";
      else div.textContent = `${cell.bombs}-${cell.food}`;
    }

    // click normale
    div.onclick = () => reveal(i);

    // right click PC
    div.addEventListener("contextmenu", e => {
      e.preventDefault();
      if (!cell.revealed && !state.gameOver) {
        cell.flagged = !cell.flagged;
        render();
      }
    });

    // long press mobile
    let pressTimer;
    div.addEventListener("touchstart", () => {
      pressTimer = setTimeout(() => {
        if (!cell.revealed && !state.gameOver) {
          cell.flagged = !cell.flagged;
          render();
        }
      }, 450);
    });
    div.addEventListener("touchend", () => clearTimeout(pressTimer));

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

  if (cell.type === "empty" && cell.bombs === 0 && cell.food === 0)
    autoReveal(i);
  else cell.revealed = true;

  if (cell.type === "bomb") state.population--;
  if (cell.type === "food") {
    state.population++;
    state.foodLeft--;
  }

  if (state.population <= 0) {
    endGame("💀 Popolazione azzerata");
    return;
  }

  if (state.foodLeft === 0) {
    if (arcadeMode) {
      arcadeLevel++;
      setTimeout(startArcadeLevel, 700);
    } else endGame("🏆 Vittoria!");
    return;
  }

  renderStatus();
  render();
}

function autoReveal(start) {
  const stack = [start];
  while (stack.length) {
    const i = stack.pop();
    const c = state.map[i];
    if (c.revealed || c.flagged || c.type === "bomb") continue;
    c.revealed = true;
    if (c.bombs === 0 && c.food === 0) {
      neighbors(i % SIZE, Math.floor(i / SIZE)).forEach(n => stack.push(n));
    }
  }
}

// ================== END GAME ==================
function endGame(msg) {
  state.gameOver = true;
  render();
  log(msg);

  if (!arcadeMode) return;

  setTimeout(() => {
    arcadeStartPopulation--;

    if (arcadeStartPopulation <= 0) {
      alert("💀 Fine Arcade!\nDevi ricominciare.");
      startArcade();
      return;
    }

    if (confirm(`Hai perso!\nContinui?\nPopolazione iniziale → ${arcadeStartPopulation}`))
      startArcadeLevel();
    else startArcade();
  }, 300);
}

// ================== LOG ==================
function log(msg) {
  logEl.textContent += msg + "\n";
  logEl.scrollTop = logEl.scrollHeight;
}

// ================== EXPORT ==================
window.startGame = startGame;
window.startArcade = startArcade;
