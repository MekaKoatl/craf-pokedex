// Genera src/data/pokemon-stats.ts con los 6 stats base de cada Pokémon
// del dataset local. Uso, desde la raíz del proyecto:
//   node scripts/fetch-stats.mjs
import { readFileSync, writeFileSync } from "node:fs";

// Rutas relativas a este archivo, no a la terminal
const DATA = new URL("../src/data/pokemon-data.ts", import.meta.url);
const OUT = new URL("../src/data/pokemon-stats.ts", import.meta.url);

const ORDER = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];

// Saca los ids del dataset sin tener que importar TypeScript
const ids = [...readFileSync(DATA, "utf8").matchAll(/\bid:\s*(\d+)/g)].map(
  (m) => Number(m[1]),
);
console.log(`${ids.length} Pokémon en el dataset`);

const stats = {};
const failed = [];

for (let i = 0; i < ids.length; i += 20) {
  const batch = ids.slice(i, i + 20);
  await Promise.all(
    batch.map(async (id) => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!res.ok) throw new Error(String(res.status));
        const p = await res.json();
        stats[id] = ORDER.map(
          (n) => p.stats.find((s) => s.stat.name === n)?.base_stat ?? 0,
        );
      } catch {
        failed.push(id);
      }
    }),
  );
  console.log(`${Math.min(i + 20, ids.length)} / ${ids.length}`);
}

const lines = ids
  .filter((id) => stats[id])
  .map((id) => `  ${id}: [${stats[id].join(", ")}],`);

writeFileSync(
  OUT,
  `// Generado por scripts/fetch-stats.mjs. No editar a mano: volver a correr el script.
// Orden: HP, Attack, Defense, Sp. Atk, Sp. Def, Speed
export const POKEMON_STATS: Record<
  number,
  [number, number, number, number, number, number]
> = {
${lines.join("\n")}
};
`,
);

console.log("Listo: src/data/pokemon-stats.ts");
if (failed.length) console.log("Fallaron estos ids:", failed.join(", "));