// Genera src/data/pokemon-data.ts con todas las especies (1 a 1025)
// y sus formas regionales. Al final compara con el archivo anterior
// y muestra qué se agregó, qué se quitó y qué cambió.
// Uso, desde la raíz del proyecto:
//   node scripts/fetch-pokemon-data.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const OUT = new URL("../src/data/pokemon-data.ts", import.meta.url);
const API = "https://pokeapi.co/api/v2";
const LAST_SPECIES = 1025;

// Generación de la especie → región
const GEN_REGION = {
  "generation-i": "kanto",
  "generation-ii": "johto",
  "generation-iii": "hoenn",
  "generation-iv": "sinnoh",
  "generation-v": "unova",
  "generation-vi": "kalos",
  "generation-vii": "alola",
  "generation-viii": "galar",
  "generation-ix": "paldea",
};

// Pokédex regional original → región (las ampliadas no cuentan)
const DEX_REGION = {
  kanto: "kanto",
  "original-johto": "johto",
  hoenn: "hoenn",
  "original-sinnoh": "sinnoh",
  "original-unova": "unova",
  "kalos-central": "kalos",
  "original-alola": "alola",
  galar: "galar",
  paldea: "paldea",
};
const REGION_ORDER = Object.values(GEN_REGION);

// Formas regionales: "-alola", "-galar-standard", "-paldea-aqua-breed"...
const REGIONAL_RE = /-(alola|galar|hisui|paldea)(?=-|$)/;
// Variantes con sufijo regional que no son formas regionales de verdad
const NOT_REGIONAL_RE = /-(totem|cap|zen)(-|$)/;

// // Pendiente
// const SPECIAL_FORMS = new Set([
//   "rotom",
//   "arceus",
//   "kyurem",
//   "genesect",
//   "xerneas",
//   "hoopa",
//   "necrozma",
//   "zacian",
//   "zamazenta",
//   "eternatus",
//   "calyrex",
// ]);

const idOf = (url) => Number(url.split("/").filter(Boolean).pop());

// Pide JSON con reintentos: con miles de pedidos, alguno puede fallar
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

// Corre fn sobre todos los items, de a `size` a la vez
async function inBatches(items, fn, label, size = 20) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
    process.stdout.write(`\r${label}: ${Math.min(i + size, items.length)} / ${items.length}`);
  }
  process.stdout.write("\n");
  return out;
}

// Cantidad de etapas del camino más largo de la cadena
function chainDepth(node) {
  return 1 + Math.max(0, ...node.evolves_to.map(chainDepth));
}

// 1) Especies
const speciesIds = Array.from({ length: LAST_SPECIES }, (_, i) => i + 1);
const species = await inBatches(
  speciesIds,
  (id) => get(`pokemon-species/${id}`),
  "Especies",
);

// 2) Cadenas evolutivas (varias especies comparten la misma)
const chainIds = [...new Set(species.map((s) => idOf(s.evolution_chain.url)))];
const chainList = await inBatches(
  chainIds,
  (id) => get(`evolution-chain/${id}`),
  "Cadenas",
);
const chainDepthById = new Map(
  chainIds.map((id, i) => [id, chainDepth(chainList[i].chain)]),
);

// 3) Pokémon: la forma por defecto de cada especie y sus regionales
const isRegionalVariety = (v) =>
  !v.is_default &&
  REGIONAL_RE.test(v.pokemon.name) &&
  !NOT_REGIONAL_RE.test(v.pokemon.name);

const pokemonIds = species.flatMap((s) =>
  s.varieties
    .filter((v) => v.is_default || isRegionalVariety(v))
    .map((v) => idOf(v.pokemon.url)),
);
const pokemonList = await inBatches(
  pokemonIds,
  (id) => get(`pokemon/${id}`),
  "Pokémon",
);
const pokemonById = new Map(pokemonIds.map((id, i) => [id, pokemonList[i]]));

// 4) Armar las entradas
const entries = [];
const regionals = [];

for (const s of species) {
  const names = s.varieties.map((v) => v.pokemon.name);
  const def = pokemonById.get(idOf(s.varieties.find((v) => v.is_default).pokemon.url));
  const evoChainLength = chainDepthById.get(idOf(s.evolution_chain.url));

  // Regiones: las Pokédex originales donde aparece.
  // Si no aparece en ninguna, la región de su generación.
  let regions = REGION_ORDER.filter((r) =>
    s.pokedex_numbers.some((p) => DEX_REGION[p.pokedex.name] === r),
  );
  if (!regions.length) regions = [GEN_REGION[s.generation.name]];

  const forms = [];
  if (names.some((n) => /-mega(-|$)/.test(n))) forms.push("M");
  if (names.some((n) => n.endsWith("-gmax"))) forms.push("G");
  if (s.varieties.some(isRegionalVariety)) forms.push("R");
  if (s.is_legendary) forms.push("Legend");
  if (s.is_mythical) forms.push("Mythic");
  if (s.is_baby) forms.push("Baby");
  // if (SPECIAL_FORMS.has(s.name)) forms.push("B");

  entries.push({
    id: s.id,
    name: s.name, // nombre de la especie: "deoxys", no "deoxys-normal"
    types: def.types.map((t) => t.type.name),
    region: GEN_REGION[s.generation.name],
    regions,
    evoChainLength,
    forms,
  });

  for (const v of s.varieties.filter(isRegionalVariety)) {
    const p = pokemonById.get(idOf(v.pokemon.url));
    const region = p.name.match(REGIONAL_RE)[1];
    regionals.push({
      id: p.id,
      name: p.name,
      types: p.types.map((t) => t.type.name),
      region,
      regions: [region],
      evoChainLength,
      forms: [],
      isRegional: true,
    });
  }
}

regionals.sort((a, b) => a.id - b.id);
const all = [...entries, ...regionals];

// 5) Comparar con el archivo anterior, si existe
function readOld() {
  if (!existsSync(OUT)) return [];
  const text = readFileSync(OUT, "utf8");
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  // Es nuestro propio archivo: se evalúa como JavaScript
  return new Function(`return ${text.slice(start, end + 1)}`)();
}
const old = readOld();
const oldById = new Map(old.map((e) => [e.id, e]));
const newById = new Map(all.map((e) => [e.id, e]));

const added = all.filter((e) => !oldById.has(e.id));
const removed = old.filter((e) => !newById.has(e.id));
const changed = [];
for (const e of all) {
  const prev = oldById.get(e.id);
  if (!prev) continue;
  for (const key of Object.keys(e)) {
    const a = JSON.stringify(prev[key]);
    const b = JSON.stringify(e[key]);
    if (a !== b) changed.push(`  ${e.name}.${key}: ${a ?? "—"} → ${b}`);
  }
}

// 6) Escribir el archivo
const fmt = (e) => {
  const lines = [
    `    id: ${e.id},`,
    `    name: ${JSON.stringify(e.name)},`,
    `    types: ${JSON.stringify(e.types)},`,
    `    region: ${JSON.stringify(e.region)},`,
    `    regions: ${JSON.stringify(e.regions)},`,
    `    evoChainLength: ${e.evoChainLength},`,
    `    forms: ${JSON.stringify(e.forms)},`,
  ];
  if (e.isRegional) lines.push("    isRegional: true,");
  return `  {\n${lines.join("\n")}\n  },`;
};

writeFileSync(
  OUT,
  `// Generado por scripts/fetch-pokemon-data.mjs. No editar a mano: volver a correr el script.
import type { PokemonEntry } from '../types/pokemon'

export const POKEMON_DATA: PokemonEntry[] = [
${all.map(fmt).join("\n")}
]
`,
);

// 7) Reporte
console.log(`\n${entries.length} especies + ${regionals.length} formas regionales = ${all.length} entradas`);
console.log(`\nAgregadas (${added.length}):`);
console.log(added.map((e) => `  #${e.id} ${e.name}`).join("\n") || "  ninguna");
console.log(`\nQuitadas (${removed.length}):`);
console.log(removed.map((e) => `  #${e.id} ${e.name}`).join("\n") || "  ninguna");
console.log(`\nCambiadas (${changed.length}):`);
console.log(changed.join("\n") || "  ninguna");
console.log("\nListo: src/data/pokemon-data.ts");