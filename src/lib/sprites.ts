import { MAX_ICON_ID } from "./constants";

/** Carpeta de íconos de PC (Gen VII) en jsDelivr. */
const ICON_BASE =
  "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/versions/generation-vii/icons";

/**
 * Cambia una URL de sprite de raw.githubusercontent.com (la que devuelve la API)
 * por su equivalente en jsDelivr, que es más rápido y tiene caché.
 * Devuelve "" si no hay URL.
 */
export function cdnSprite(url: string | null | undefined): string {
  if (!url) return "";
  return url.replace(
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/",
    "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/",
  );
}

/**
 * Formas de Alola con ícono de PC (son de la Gen VII). Las de Galar,
 * Hisui y Paldea no tienen y usan el sprite normal.
 */
const ALOLAN_ICON_IDS = new Set([
  10091,
  10092,
  ...Array.from({ length: 16 }, (_, i) => 10100 + i), // 10100 a 10115
]);

/** Indica si existe ícono de PC para el id: todos hasta `MAX_ICON_ID` más las formas de Alola. */
export function hasBoxIcon(id: number): boolean {
  return (id >= 1 && id <= MAX_ICON_ID) || ALOLAN_ICON_IDS.has(id);
}

/** URL del ícono de PC. Verificar antes con `hasBoxIcon`. */
export function boxIconUrl(id: number): string {
  return `${ICON_BASE}/${id}.png`;
}

/** Unown animado que se muestra mientras carga un sprite. */
export const LOADING_SPRITE =
  "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/versions/generation-v/black-white/animated/201.gif";

/** Carpeta de sprites de Pokémon en jsDelivr. */
const POKEMON_BASE =
  "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon";

/** URL del sprite frontal por defecto. */
export function pokemonSpriteUrl(id: number): string {
  return `${POKEMON_BASE}/${id}.png`;
}

/** Ícono de PC si existe; si no, el sprite normal. */
export function iconOrSprite(id: number): string {
  return hasBoxIcon(id) ? boxIconUrl(id) : pokemonSpriteUrl(id);
}

/** Arte oficial (Ken Sugimori). Existe para todas las especies y formas. */
export function artworkUrl(id: number): string {
  return `${POKEMON_BASE}/other/official-artwork/${id}.png`;
}

/** Arte de Dream World (SVG). No existe para todos; ante un error, usar `artworkUrl`. */
export function dreamWorldUrl(id: number): string {
  return `${POKEMON_BASE}/other/dream-world/${id}.svg`;
}

/** Carpeta de sprites de objetos en jsDelivr. */
const ITEM_BASE =
  "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items";

/**
 * URLs de imágenes grandes de un objeto, de mejor a peor calidad.
 * La API no las informa y cada carpeta tiene solo algunos objetos,
 * por lo que se prueban en orden y se pasa a la siguiente ante un error.
 */
export function itemArtUrls(name: string): string[] {
  return [
    `${ITEM_BASE}/gen9/${name}.png`, // HD, 160px
    `${ITEM_BASE}/gen8/${name}.png`, // HD, 160px
    `${ITEM_BASE}/dream-world/${name}.png`, // dibujo, ~90px
  ];
}
