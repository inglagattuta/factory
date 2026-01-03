import { checkCrisis, applyCrisis } from "./crisis.js";
import { pickEvent } from "./events.js";

export function nextTurn(gameState, rng) {
  gameState.turn++;
  gameState.stats.totalTurns++;

  applyProduction(gameState);
  checkCrisis(gameState);

  if (gameState.crisis) {
    applyCrisis(gameState);
    gameState.crisis.turnsLeft--;
    if (gameState.crisis.turnsLeft <= 0) {
      return { gameOver: true };
    }
  }

  const event = pickEvent(gameState, rng);
  if (event) {
    applyEvent(gameState, event);
  }

  unlockActions(gameState);
  return { gameOver: false };
}

function applyProduction(gameState) {
  for (const row of gameState.map) {
    for (const tile of row) {
      if (!tile.discovered || !tile.building) continue;

      if (tile.building === "FARM") gameState.resources.food += 2;
      if (tile.building === "MINE") gameState.resources.gold += 2;
    }
  }
}

function unlockActions(gameState) {
  if (gameState.turn >= 6) gameState.unlockedActions.defend = true;
  if (gameState.turn >= 13) gameState.unlockedActions.sacrifice = true;
}

function applyEvent(gameState, event) {
  if (event.effect === "FOOD_MINUS") gameState.resources.food -= 2;
  if (event.effect === "STABILITY_MINUS") gameState.resources.stability -= 1;
}
