import { REGIONAL_SUFFIX_LIST, REGIONAL_PREFIX_MAP } from "./constants";
import { POKEMON_DATA } from "../data/pokemon-data";
import type { PokemonEntry } from "../types/pokemon";

const GENDER_SUFFIXES = ["-male", "-female"];

// "raichu-alola" → "Alolan Raichu" · "meowstic-female" → "Meowstic"
export function getRegionalDisplayName(name: string): string {
  // El género no forma parte del nombre que mostramos
  const gender = GENDER_SUFFIXES.find((g) => name.endsWith(g));
  const base = gender ? name.slice(0, -gender.length) : name;

  const suffix = REGIONAL_SUFFIX_LIST.find((s) => base.endsWith(s));
  if (!suffix) return base.charAt(0).toUpperCase() + base.slice(1);

  const baseName = base.replace(suffix, "");
  return `${REGIONAL_PREFIX_MAP[suffix]} ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`;
}

// export function getRandomPokemonId(): number {
//   return Math.floor(Math.random() * TOTAL_POKEMON) + 1
// }

// Devuelve las entradas regionales del dataset cuyo nombre base coincide
// Ej: "raichu" → [{ name: "raichu-alola", ... }]
export function getRegionalFormsOf(baseName: string): PokemonEntry[] {
  return POKEMON_DATA.filter((e) => {
    if (!e.isRegional) return false;
    const suffix = REGIONAL_SUFFIX_LIST.find((s) => e.name.endsWith(s));
    return suffix ? e.name.slice(0, -suffix.length) === baseName : false;
  });
}
