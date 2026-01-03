import { createInitialGameState } from "./game/gameState.js";
import { createMap } from "./game/map.js";
import { createRNG } from "./game/rng.js";
import { nextTurn } from "./game/turnEngine.js";

const state = createInitialGameState(123);
state.map = createMap();

const rng = createRNG(state.seed);

console.log("=== MicroDominion ===");

while (true) {
  const { gameOver } = nextTurn(state, rng);
  console.log(`Turno ${state.turn}`, state.resources);

  if (gameOver) {
    console.log("GAME OVER");
    break;
  }

  if (state.turn >= 15) break; // limite MVP
}
