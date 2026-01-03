import fs from "fs";

const events = JSON.parse(
  fs.readFileSync(
    new URL("../data/events.json", import.meta.url),
    "utf-8"
  )
);

export function pickEvent(gameState, rng) {
  let pool = [];

  for (const e of events) {
    let weight = e.weight;

    if (e.condition === "LOW_FOOD" && gameState.resources.food < 3) {
      weight *= 3;
    }

    if (weight > 0) {
      for (let i = 0; i < weight; i++) {
        pool.push(e);
      }
    }
  }

  if (pool.length === 0) return null;
  return pool[Math.floor(rng() * pool.length)];
}
