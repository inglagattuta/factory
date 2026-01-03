export function explore(gameState, x, y, rng) {
  const tile = gameState.map[y][x];
  if (!tile || tile.discovered) return;

  gameState.resources.food -= 1;
  tile.discovered = true;
  gameState.stats.exploredTiles++;

  const r = rng();
  if (r < 0.2) tile.type = "FIELD";
  else if (r < 0.4) tile.type = "MINE";
  else if (r < 0.55) tile.type = "VILLAGE";
  else if (r < 0.7) tile.type = "RUINS";
  else if (r < 0.85) tile.type = "ENEMY";
  else tile.type = "EMPTY";
}
