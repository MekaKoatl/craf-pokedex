import { FORM_ICONS, SPECIES_ICONS } from "../data/box-icons";

/**
 * Carpeta de íconos de PC de pokesprite (estilo Gen VIII) en jsDelivr, en una
 * versión fija. Debe coincidir con `POKESPRITE_COMMIT` de `scripts/fetch-box-icons.mjs`.
 */
const ICON_BASE =
  "https://cdn.jsdelivr.net/gh/msikma/pokesprite@c5aaa610ff2acdf7fd8e2dccd181bca8be9fcb3e/pokemon-gen8/regular";

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

/** Ícono de cada especie (1 a 905) como "archivo:xxyywwhh"; índice 0 = #1. */
const SPECIES = SPECIES_ICONS.split(",");

/** Entrada "archivo:xxyywwhh" del ícono de un id, o undefined si no tiene. */
function iconEntry(id: number): string | undefined {
  return id <= SPECIES.length ? SPECIES[id - 1] || undefined : FORM_ICONS[id];
}

/**
 * Indica si existe ícono de PC para el id: hasta el #905 y las formas de
 * Alola, Galar e Hisui (ver `src/data/box-icons.ts`).
 */
export function hasBoxIcon(id: number): boolean {
  return iconEntry(id) !== undefined;
}

/** Ids de todos los Pokémon con ícono de PC. */
export function idsWithBoxIcon(): number[] {
  return [
    ...SPECIES.flatMap((entry, i) => (entry ? [i + 1] : [])),
    ...Object.keys(FORM_ICONS).map(Number),
  ];
}

/** URL del ícono de PC (lienzo de 68×56). Verificar antes con `hasBoxIcon`. */
export function boxIconUrl(id: number): string {
  return `${ICON_BASE}/${iconEntry(id)?.split(":")[0]}.png`;
}

/** Rectángulo que ocupa el Pokémon dentro del lienzo del ícono, en px. */
export type IconBounds = { x: number; y: number; w: number; h: number };

/** Rectángulo del Pokémon dentro de su ícono de PC, o undefined si no tiene. */
export function boxIconBounds(id: number): IconBounds | undefined {
  const box = iconEntry(id)?.split(":")[1];
  if (!box) return undefined;
  const [x, y, w, h] = [0, 2, 4, 6].map((i) => Number(box.slice(i, i + 2)));
  return { x, y, w, h };
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
