export function createInitialGameState(seed = Date.now()) {
  return {
    turn: 0,
    seed,
    resources: {
      gold: 5,
      food: 5,
      stability: 5,
      population: 3
    },
    crisis: null,
    unlockedActions: {
      explore: true,
      build: true,
      manage: true,
      defend: false,
      outpost: false,
      laws: false,
      sacrifice: false,
      expand: false
    },
    map: null,
    stats: {
      crisesCount: 0,
      exploredTiles: 0,
      totalTurns: 0
    }
  };
}
