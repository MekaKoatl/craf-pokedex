import { MAX_ICON_ID } from "./constants";

const ICON_BASE =
  "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/versions/generation-vii/icons";

export function cdnSprite(url: string | null | undefined): string {
  if (!url) return "";
  return url.replace(
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/",
    "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/",
  );
}

// El icono de PC existe para todos los ids hasta MAX_ICON_ID, sin huecos
export function hasBoxIcon(id: number): boolean {
  return id >= 1 && id <= MAX_ICON_ID;
}

export function boxIconUrl(id: number): string {
  return `${ICON_BASE}/${id}.png`;
}

// Unown animado, se usa como indicador de "cargando" en los sprites
export const LOADING_SPRITE =
  "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/versions/generation-v/black-white/animated/201.gif";

const POKEMON_BASE =
  "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon";

export function pokemonSpriteUrl(id: number): string {
  return `${POKEMON_BASE}/${id}.png`;
}

// Icono de PC si existe, si no el sprite normal
export function iconOrSprite(id: number): string {
  return hasBoxIcon(id) ? boxIconUrl(id) : pokemonSpriteUrl(id);
}
