// Genera src/data/regional-dex.ts: qué especies están en la Pokédex
// regional de cada juego (Unova en Black 2, Galar + DLC en Sword...).
// Uso, desde la raíz del proyecto:
//   node scripts/fetch-regional-dex.mjs
import { writeFileSync } from "node:fs";

const OUT = new URL("../src/data/regional-dex.ts", import.meta.url);
const API = "https://pokeapi.co/api/v2";

// Los mismos juegos que fetch-games.mjs
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

const idOf = (url) => Number(url.split("/").filter(Boolean).pop());

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

// Varias versiones comparten Pokédex (Kanto): se pide una sola vez
const dexCache = new Map();
async function dexSpecies(name) {
  if (!dexCache.has(name)) {
    const dex = await get(`pokedex/${name}`);
    dexCache.set(
      name,
      dex.pokemon_entries.map((e) => idOf(e.pokemon_species.url)),
    );
  }
  return dexCache.get(name);
}

const lines = [];
for (const g of GROUPS) {
  const vg = await get(`version-group/${g}`);
  // La Nacional no es regional
  const dexNames = vg.pokedexes
    .map((d) => d.name)
    .filter((n) => n !== "national");
  const ids = new Set();
  for (const n of dexNames) for (const id of await dexSpecies(n)) ids.add(id);
  const sorted = [...ids].sort((a, b) => a - b);
  console.log(`  ${g}: ${sorted.length} (${dexNames.join(", ") || "sin Pokédex"})`);
  lines.push(`  "${g}": [${sorted.join(", ")}],`);
}

writeFileSync(
  OUT,
  `// Generado por scripts/fetch-regional-dex.mjs. No editar a mano: volver a correr el script.
// Juego (version group) → números de especie de su Pokédex regional
export const REGIONAL_DEX: Record<string, number[]> = {
${lines.join("\n")}
};
`,
);

console.log("Listo: src/data/regional-dex.ts");