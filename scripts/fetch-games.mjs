// Genera src/data/pokemon-games.ts: qué Pokémon hay en cada juego.
// Un Pokémon está en un juego si la API le da movimientos en ese juego.
// Uso, desde la raíz del proyecto:
//   node scripts/fetch-games.mjs
import { readFileSync, writeFileSync } from "node:fs";

// Rutas relativas a este archivo, no a la terminal
const DATA = new URL("../src/data/pokemon-data.ts", import.meta.url);
const OUT = new URL("../src/data/pokemon-games.ts", import.meta.url);

// Los "version groups" de juegos principales, de más viejo a más nuevo.
// Quedan afuera Colosseum/XD, las versiones japonesas y Champions.
const GROUPS = [
  "red-blue",
  "yellow",
  "gold-silver",
  "crystal",
  "ruby-sapphire",
  "emerald",
  "firered-leafgreen",
  "diamond-pearl",
  "platinum",
  "heartgold-soulsilver",
  "black-white",
  "black-2-white-2",
  "x-y",
  "omega-ruby-alpha-sapphire",
  "sun-moon",
  "ultra-sun-ultra-moon",
  "lets-go-pikachu-lets-go-eevee",
  "sword-shield",
  "brilliant-diamond-shining-pearl",
  "legends-arceus",
  "scarlet-violet",
  "legends-za",
];

// Saca los ids del dataset sin tener que importar TypeScript
const ids = [...readFileSync(DATA, "utf8").matchAll(/\bid:\s*(\d+)/g)].map(
  (m) => Number(m[1]),
);
console.log(`${ids.length} Pokémon en el dataset`);

// juego → ids de Pokémon
const byGroup = Object.fromEntries(GROUPS.map((g) => [g, []]));
const failed = [];

for (let i = 0; i < ids.length; i += 20) {
  const batch = ids.slice(i, i + 20);
  await Promise.all(
    batch.map(async (id) => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!res.ok) throw new Error(String(res.status));
        const p = await res.json();
        const present = new Set(
          p.moves.flatMap((m) =>
            m.version_group_details.map((d) => d.version_group.name),
          ),
        );
        for (const g of GROUPS) if (present.has(g)) byGroup[g].push(id);
      } catch {
        failed.push(id);
      }
    }),
  );
  console.log(`${Math.min(i + 20, ids.length)} / ${ids.length}`);
}

// Los lotes terminan en cualquier orden: se ordenan los ids
const lines = GROUPS.map((g) => {
  byGroup[g].sort((a, b) => a - b);
  return `  "${g}": [${byGroup[g].join(", ")}],`;
});

writeFileSync(
  OUT,
  `// Generado por scripts/fetch-games.mjs. No editar a mano: volver a correr el script.
// Juego (version group) → ids de los Pokémon que existen en él
export const GAME_POKEMON: Record<string, number[]> = {
${lines.join("\n")}
};
`,
);

console.log("\nPokémon por juego:");
for (const g of GROUPS) console.log(`  ${g}: ${byGroup[g].length}`);
console.log("\nListo: src/data/pokemon-games.ts");
if (failed.length) console.log("Fallaron estos ids:", failed.join(", "));