import { createInitialGameState } from "./game/gameState.js";
import { createMap } from "./game/map.js";
import { createRNG } from "./game/rng.js";
import { nextTurn } from "./game/turnEngine.js";
import { applyAction } from "./game/actions.js";

// ===============================
// INIZIALIZZAZIONE GIOCO
// ===============================
const state = createInitialGameState(123);
state.map = createMap();

const rng = createRNG(state.seed);

console.log("=== MicroDominion ===");

// ===============================
// IA SEMPLICE DEL GIOCATORE
// ===============================
function chooseAction(state) {
  if (state.resources.food < 2) return "GATHER";
  if (state.resources.stability < 4) return "BUILD";
  return "EXPLORE";
}

// ===============================
// LOOP PRINCIPALE
// ===============================
while (true) {
  // Scelta azione
  const action = chooseAction(state);
  applyAction(state, action, rng);

  // Avanza il turno
  const { gameOver } = nextTurn(state, rng);

  // Log stato
  console.log(
    `Turno ${state.turn} | Azione: ${action}`,
    state.resources
  );

  // Fine partita
  if (gameOver) {
    console.log("GAME OVER");
    break;
  }

  // Limite MVP
  if (state.turn >= 15) {
    console.log("FINE SIMULAZIONE (MVP)");
    break;
  }
}
