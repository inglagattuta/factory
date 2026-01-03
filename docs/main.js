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
  gameOver: false
};

// ===============================
// UI
// ===============================
const statusEl = document.getElementById("status");
const logEl = document.getElementById("log");
const buttons = document.querySelectorAll("button");

// ===============================
// LOG
// ===============================
function log(text) {
  logEl.textContent += text + "\n";
  logEl.scrollTop = logEl.scrollHeight;
}

// ===============================
// ACTIONS
// ===============================
function applyAction(action) {
  if (action === "GATHER") state.resources.food += 2;
  if (action === "BUILD" && state.resources.gold >= 2) {
    state.resources.gold -= 2;
    state.resources.stability += 1;
  }
  if (action === "EXPLORE") {
    Math.random() < 0.5
      ? state.resources.food += 2
      : state.resources.stability -= 1;
  }
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
}

// ===============================
// EVENT HANDLERS
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

// INIT
render();
log("🏁 Inizio partita");
