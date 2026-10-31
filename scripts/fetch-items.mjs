// Genera src/data/held-items.ts: los objetos que se pueden equipar
// y desde qué generación existen.
// Uso, desde la raíz del proyecto:
//   node scripts/fetch-items.mjs
import { writeFileSync } from "node:fs";

const OUT = new URL("../src/data/held-items.ts", import.meta.url);
const API = "https://pokeapi.co/api/v2";

// Categorías de la API → grupo en el que se muestran en el Team Planner
const CATEGORIES = {
  "held-items": "held",
  choice: "held",
  "bad-held-items": "held",
  training: "held",
  "effort-training": "held",
  "type-enhancement": "type",
  plates: "type",
  memories: "type",
  jewels: "type",
  "species-specific": "species",
  medicine: "berry",
  "in-a-pinch": "berry",
  "picky-healing": "berry",
  "type-protection": "berry",
  "effort-drop": "berry",
  other: "berry",
  "mega-stones": "mega",
  "z-crystals": "z",
};

const GEN_NUM = {
  "generation-i": 1,
  "generation-ii": 2,
  "generation-iii": 3,
  "generation-iv": 4,
  "generation-v": 5,
  "generation-vi": 6,
  "generation-vii": 7,
  "generation-viii": 8,
  "generation-ix": 9,
};

// Pide JSON con reintentos
async function get(path) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${API}/${path}`);
      if (res.ok) return await res.json();
      if (res.status === 404) break;
    } catch {
      // se reintenta
    }
  }
  throw new Error(`No se pudo bajar ${path}`);
}

// 1) Los nombres de los objetos de cada categoría
const names = {}; // objeto → grupo
for (const [cat, group] of Object.entries(CATEGORIES)) {
  const data = await get(`item-category/${cat}`);
  for (const i of data.items) names[i.name] = group;
}
const list = Object.keys(names);
console.log(`${list.length} objetos`);

// 2) Desde qué generación existe cada uno
const result = {}; // objeto → [grupo, generación]
const skipped = [];
for (let i = 0; i < list.length; i += 20) {
  await Promise.all(
    list.slice(i, i + 20).map(async (name) => {
      const item = await get(`item/${name}`);
      const gens = item.game_indices
        .map((g) => GEN_NUM[g.generation.name])
        .filter(Boolean);
      // Sin datos de juego: todavía no se puede saber dónde existe
      if (!gens.length) return skipped.push(name);
      result[name] = [names[name], Math.min(...gens)];
    }),
  );
  process.stdout.write(`\r${Math.min(i + 20, list.length)} / ${list.length}`);
}
process.stdout.write("\n");

const lines = Object.keys(result)
  .sort((a, b) => a.localeCompare(b))
  .map((n) => `  "${n}": ["${result[n][0]}", ${result[n][1]}],`);

writeFileSync(
  OUT,
  `// Generado por scripts/fetch-items.mjs. No editar a mano: volver a correr el script.
// Objeto → [grupo, generación en la que aparece]
export const HELD_ITEMS: Record<string, [string, number]> = {
${lines.join("\n")}
};
`,
);

console.log(`Listo: src/data/held-items.ts (${lines.length} objetos)`);
if (skipped.length)
  console.log(
    `Sin datos de juego, quedan afuera (${skipped.length}):`,
    skipped.join(", "),
  );
