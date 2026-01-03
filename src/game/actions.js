export function applyAction(gameState, action, rng) {
  switch (action) {
    case "GATHER":
      gameState.resources.food += 2;
      break;

    case "BUILD":
      if (gameState.resources.gold >= 2) {
        gameState.resources.gold -= 2;
        gameState.resources.stability += 1;
      }
      break;

    case "EXPLORE":
      if (rng() < 0.5) {
        gameState.resources.food += 2;
      } else {
        gameState.resources.stability -= 1;
      }
      break;
  }
}
