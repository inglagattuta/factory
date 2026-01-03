export function checkCrisis(gameState) {
  if (gameState.crisis) return;

  const r = gameState.resources;
  if (r.food <= 0) start(gameState, "FOOD");
  else if (r.gold <= 0) start(gameState, "GOLD");
  else if (r.stability <= 0) start(gameState, "STABILITY");
}

function start(gameState, type) {
  gameState.crisis = { type, turnsLeft: 3 };
  gameState.stats.crisesCount++;
}

export function applyCrisis(gameState) {
  if (!gameState.crisis) return;

  if (gameState.crisis.type === "FOOD") {
    gameState.resources.population -= 1;
  }
}
