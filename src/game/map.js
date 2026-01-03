export function createMap(size = 5) {
  const map = [];

  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      row.push({
        x,
        y,
        discovered: false,
        type: null,
        building: null,
        level: 0,
        threat: 0
      });
    }
    map.push(row);
  }

  const c = Math.floor(size / 2);
  map[c][c].discovered = true;

  return map;
}
