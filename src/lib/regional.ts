import { REGIONAL_SUFFIX_LIST, REGIONAL_PREFIX_MAP } from "./constants";
import { POKEMON_DATA } from "../data/pokemon-data";
import type { PokemonEntry } from "../types/pokemon";

const GENDER_SUFFIXES = ["-male", "-female"];

// Formas por defecto que la API nombra con sufijo: se muestra solo la especie.
// (Las de género, como "meowstic-male", ya las resuelve GENDER_SUFFIXES.)
const DEFAULT_FORMS: Record<string, string> = {
  "deoxys-normal": "deoxys",
  "wormadam-plant": "wormadam",
  "giratina-altered": "giratina",
  "shaymin-land": "shaymin",
  "basculin-red-striped": "basculin",
  "darmanitan-standard": "darmanitan",
  "tornadus-incarnate": "tornadus",
  "thundurus-incarnate": "thundurus",
  "landorus-incarnate": "landorus",
  "keldeo-ordinary": "keldeo",
  "meloetta-aria": "meloetta",
  "aegislash-shield": "aegislash",
  "pumpkaboo-average": "pumpkaboo",
  "gourgeist-average": "gourgeist",
  "zygarde-50": "zygarde",
  "oricorio-baile": "oricorio",
  "lycanroc-midday": "lycanroc",
  "wishiwashi-solo": "wishiwashi",
  "minior-red-meteor": "minior",
  "mimikyu-disguised": "mimikyu",
  "toxtricity-amped": "toxtricity",
  "eiscue-ice": "eiscue",
  "morpeko-full-belly": "morpeko",
  "urshifu-single-strike": "urshifu",
  "enamorus-incarnate": "enamorus",
  "maushold-family-of-four": "maushold",
  "squawkabilly-green-plumage": "squawkabilly",
  "palafin-zero": "palafin",
  "tatsugiri-curly": "tatsugiri",
  "dudunsparce-two-segment": "dudunsparce",
};

// Regionales con un sufijo extra que la regla general no entiende
const SPECIAL_NAMES: Record<string, string> = {
  "darmanitan-galar-standard": "Galarian Darmanitan",
  "tauros-paldea-combat-breed": "Paldean Tauros (Combat Breed)",
  "tauros-paldea-blaze-breed": "Paldean Tauros (Blaze Breed)",
  "tauros-paldea-aqua-breed": "Paldean Tauros (Aqua Breed)",
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// "raichu-alola" → "Alolan Raichu" · "meowstic-female" → "Meowstic"
// "mimikyu-disguised" → "Mimikyu"
export function getRegionalDisplayName(name: string): string {
  if (SPECIAL_NAMES[name]) return SPECIAL_NAMES[name];

  // El género no forma parte del nombre que mostramos
  const gender = GENDER_SUFFIXES.find((g) => name.endsWith(g));
  const noGender = gender ? name.slice(0, -gender.length) : name;
  // La forma por defecto se muestra como la especie
  const base = DEFAULT_FORMS[noGender] ?? noGender;

  const suffix = REGIONAL_SUFFIX_LIST.find((s) => base.endsWith(s));
  if (!suffix) return capitalize(base);

  const baseName = base.replace(suffix, "");
  return `${REGIONAL_PREFIX_MAP[suffix]} ${capitalize(baseName)}`;
}

// Devuelve las entradas regionales del dataset cuyo nombre base coincide
// Ej: "raichu" → [{ name: "raichu-alola", ... }]
// Acepta sufijos extra: "darmanitan-galar-standard" también es de "darmanitan"
export function getRegionalFormsOf(baseName: string): PokemonEntry[] {
  return POKEMON_DATA.filter((e) => {
    if (!e.isRegional) return false;
    const suffix = REGIONAL_SUFFIX_LIST.find(
      (s) => e.name.endsWith(s) || e.name.includes(`${s}-`),
    );
    return suffix ? e.name.slice(0, e.name.indexOf(suffix)) === baseName : false;
  });
}