/**
 * Genera `src/data/regional-dex.ts`: las especies de la Pokédex regional de
 * cada juego, en su orden (Unova en Black 2, Galar + DLC en Sword...).
 * No depende de otros datasets.
 *
 * Uso, desde la raíz del proyecto:
 *   node scripts/fetch-regional-dex.mjs
 */
import { writeFileSync } from "node:fs";

const OUT = new URL("../src/data/regional-dex.ts", import.meta.url);
const API = "https://pokeapi.co/api/v2";

// Mismos grupos de versiones que fetch-games.mjs
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
      // reintenta
    }
  }
  throw new Error(`No se pudo bajar ${path}`);
}

// Varias versiones comparten Pokédex (p. ej. Kanto): cada una se pide una sola vez
const dexCache = new Map();
async function dexSpecies(name) {
  if (!dexCache.has(name)) {
    const dex = await get(`pokedex/${name}`);
    dexCache.set(
      name,
      // En el orden de la Pokédex regional (entry_number), no el nacional
      [...dex.pokemon_entries]
        .sort((a, b) => a.entry_number - b.entry_number)
        .map((e) => idOf(e.pokemon_species.url)),
    );
  }
  return dexCache.get(name);
}

const lines = [];
for (const g of GROUPS) {
  const vg = await get(`version-group/${g}`);
  // Se excluye la Pokédex Nacional
  const dexNames = vg.pokedexes
    .map((d) => d.name)
    .filter((n) => n !== "national");
  // Set: sin repetidos y en orden de inserción (Pokédex principal, después DLC)
  const ids = new Set();
  for (const n of dexNames) for (const id of await dexSpecies(n)) ids.add(id);
  const sorted = [...ids];
  console.log(
    `  ${g}: ${sorted.length} (${dexNames.join(", ") || "sin Pokédex"})`,
  );
  lines.push(`  "${g}": [${sorted.join(", ")}],`);
}

writeFileSync(
  OUT,
  `// Generado por scripts/fetch-regional-dex.mjs. No editar a mano: volver a correr el script.
// Juego (version group) → números de especie, en el orden de su Pokédex regional
export const REGIONAL_DEX: Record<string, number[]> = {
${lines.join("\n")}
};
`,
);

console.log("Listo: src/data/regional-dex.ts");
