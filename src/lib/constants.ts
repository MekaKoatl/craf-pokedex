/** URL base de la PokéAPI (v2). */
export const BASE_URL = "https://pokeapi.co/api/v2";

/** Cantidad de especies de la Pokédex Nacional que cubre el sitio. */
export const TOTAL_POKEMON = 1025;

/** Sufijos que identifican una forma regional en el nombre de la API. */
export const REGIONAL_SUFFIX_LIST = ["-alola", "-galar", "-hisui", "-paldea"];

/** Adjetivo que se antepone al nombre de una forma regional, según su sufijo. */
export const REGIONAL_PREFIX_MAP: Record<string, string> = {
  "-alola": "Alolan",
  "-galar": "Galarian",
  "-hisui": "Hisuian",
  "-paldea": "Paldean",
};
