import events from "../data/events.json" assert { type: "json" };

export function pickEvent(gameState, rng) {
  let pool = [];

  for (const e of events) {
    let weight = e.weight;

    if (e.condition === "LOW_FOOD" && gameState.resources.food < 3) {
      weight *= 3;
    }

    for (let i = 0; i < weight; i++) {
      pool.push(e);
    }
  }

  if (pool.length === 0) return null;
  return pool[Math.floor(rng() * pool.length)];
}
