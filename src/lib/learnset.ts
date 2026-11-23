import type { PokemonFull } from "../types/pokemon";

/**
 * Grupos de versiones de juegos principales, del más nuevo al más viejo.
 * No se ordena por id porque hay grupos con id alto que no son juegos
 * principales (red-green-japan = 28, champions = 32).
 */
const VERSION_ORDER = [
  "legends-za",
  "scarlet-violet",
  "legends-arceus",
  "brilliant-diamond-shining-pearl",
  "sword-shield",
  "lets-go-pikachu-lets-go-eevee",
  "ultra-sun-ultra-moon",
  "sun-moon",
  "omega-ruby-alpha-sapphire",
  "x-y",
  "black-2-white-2",
  "black-white",
  "heartgold-soulsilver",
  "platinum",
  "diamond-pearl",
  "firered-leafgreen",
  "emerald",
  "ruby-sapphire",
  "crystal",
  "gold-silver",
  "yellow",
  "red-blue",
];

/** Movimientos que aprende un Pokémon en un juego, agrupados por método. */
export interface Learnset {
  /** Grupo de versiones del que se tomaron los datos. */
  version: string;
  /** Por nivel, ordenados por nivel y nombre. */
  levelUp: { name: string; level: number }[];
  /** Al evolucionar (nivel 0 en la API). */
  evolution: string[];
  /** Por MT/MO. */
  machine: string[];
  /** Como movimiento huevo. */
  egg: string[];
}

/**
 * Arma el learnset del juego más reciente en el que aparece el Pokémon.
 * Devuelve null si no aparece en ningún juego principal.
 */
export function buildLearnset(p: PokemonFull): Learnset | null {
  const present = new Set(
    p.moves.flatMap((m) =>
      m.version_group_details.map((d) => d.version_group.name),
    ),
  );
  const version = VERSION_ORDER.find((v) => present.has(v));
  if (!version) return null;

  const levelUp: Learnset["levelUp"] = [];
  const evolution: string[] = [];
  const machine: string[] = [];
  const egg: string[] = [];

  for (const m of p.moves) {
    for (const d of m.version_group_details) {
      if (d.version_group.name !== version) continue;
      const method = d.move_learn_method.name;
      if (method === "level-up") {
        // La API usa nivel 0 para "al evolucionar"
        if (d.level_learned_at === 0) evolution.push(m.move.name);
        else levelUp.push({ name: m.move.name, level: d.level_learned_at });
      } else if (method === "machine") {
        machine.push(m.move.name);
      } else if (method === "egg") {
        egg.push(m.move.name);
      }
    }
  }

  levelUp.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

  // Sin repetidos: la API a veces duplica entradas
  const uniqSorted = (arr: string[]) =>
    [...new Set(arr)].sort((a, b) => a.localeCompare(b));

  return {
    version,
    levelUp,
    evolution: uniqSorted(evolution),
    machine: uniqSorted(machine),
    egg: uniqSorted(egg),
  };
}
