import type { PokemonFull } from "../types/pokemon";

// Del juego más nuevo al más viejo. No usamos el id del version-group
// porque hay grupos con id alto que no son juegos principales
// (red-green-japan = 28, champions = 32).
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

export interface Learnset {
  version: string;
  levelUp: { name: string; level: number }[];
  evolution: string[];
  machine: string[];
  egg: string[];
}

export function buildLearnset(p: PokemonFull): Learnset | null {
  // Todos los juegos en los que aparece este Pokémon
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
        // Nivel 0 significa "se aprende al evolucionar"
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

  // Set quita repetidos por si la API duplica alguna entrada
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
