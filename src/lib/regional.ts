import { REGIONAL_SUFFIX_LIST, REGIONAL_PREFIX_MAP } from "./constants";
import { POKEMON_DATA } from "../data/pokemon-data";
import type { PokemonEntry } from "../types/pokemon";

/** Sufijos de género que no forman parte del nombre visible. */
const GENDER_SUFFIXES = ["-male", "-female"];

/**
 * Formas por defecto que la API nombra con sufijo; se muestran con el nombre
 * de la especie. Las de género ("meowstic-male") se resuelven con `GENDER_SUFFIXES`.
 */
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

/** Formas regionales con un sufijo extra que la regla general no cubre. */
const SPECIAL_NAMES: Record<string, string> = {
  "darmanitan-galar-standard": "Galarian Darmanitan",
  "tauros-paldea-combat-breed": "Paldean Tauros (Combat Breed)",
  "tauros-paldea-blaze-breed": "Paldean Tauros (Blaze Breed)",
  "tauros-paldea-aqua-breed": "Paldean Tauros (Aqua Breed)",
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Nombre visible de un Pokémon a partir del nombre de la API.
 *
 * @example
 * getRegionalDisplayName("raichu-alola"); // "Alolan Raichu"
 * getRegionalDisplayName("meowstic-female"); // "Meowstic"
 * getRegionalDisplayName("mimikyu-disguised"); // "Mimikyu"
 */
export function getRegionalDisplayName(name: string): string {
  if (SPECIAL_NAMES[name]) return SPECIAL_NAMES[name];

  // Sin sufijo de género
  const gender = GENDER_SUFFIXES.find((g) => name.endsWith(g));
  const noGender = gender ? name.slice(0, -gender.length) : name;
  const base = DEFAULT_FORMS[noGender] ?? noGender;

  const suffix = REGIONAL_SUFFIX_LIST.find((s) => base.endsWith(s));
  if (!suffix) return capitalize(base);

  const baseName = base.replace(suffix, "");
  return `${REGIONAL_PREFIX_MAP[suffix]} ${capitalize(baseName)}`;
}

/**
 * Formas regionales del dataset de una especie. Acepta sufijos extra:
 * "darmanitan-galar-standard" también se considera forma de "darmanitan".
 *
 * @example
 * getRegionalFormsOf("raichu"); // [{ name: "raichu-alola", ... }]
 */
export function getRegionalFormsOf(baseName: string): PokemonEntry[] {
  return POKEMON_DATA.filter((e) => {
    if (!e.isRegional) return false;
    const suffix = REGIONAL_SUFFIX_LIST.find(
      (s) => e.name.endsWith(s) || e.name.includes(`${s}-`),
    );
    return suffix
      ? e.name.slice(0, e.name.indexOf(suffix)) === baseName
      : false;
  });
}
