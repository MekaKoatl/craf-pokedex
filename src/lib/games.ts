import { GAME_POKEMON } from "../data/pokemon-games";
import { artworkUrl, pokemonSpriteUrl } from "./sprites";

/** Una versión de juego principal. */
export interface Game {
  /** Versión, p. ej. "omega-ruby". */
  id: string;
  /** Nombre visible, p. ej. "Omega Ruby". */
  label: string;
  /** Grupo de versiones de la API, p. ej. "omega-ruby-alpha-sapphire". */
  group: string;
  gen: number;
}

/** Mecánicas disponibles en un juego. Las que no existen se ocultan en el editor de equipos. */
export interface GameFeatures {
  abilities: boolean;
  items: boolean;
  natures: boolean;
  /** El tipo Fairy existe (Gen VI en adelante). */
  fairy: boolean;
}

const NONE = { abilities: false, items: false, natures: false };
const ALL = { abilities: true, items: true, natures: true };

/** Grupos con mecánicas reducidas. Los que no figuran tienen todas. */
const GROUP_FEATURES: Record<string, typeof ALL> = {
  "red-blue": NONE,
  yellow: NONE,
  "gold-silver": { ...NONE, items: true },
  crystal: { ...NONE, items: true },
  // Sin habilidades ni objetos equipables
  "lets-go-pikachu-lets-go-eevee": { ...NONE, natures: true },
  "legends-arceus": { ...NONE, natures: true },
};

/** Mecánicas disponibles en un juego. */
export function gameFeatures(game: Game): GameFeatures {
  return { ...(GROUP_FEATURES[game.group] ?? ALL), fairy: game.gen >= 6 };
}

/** Todos los juegos principales, en orden cronológico. */
const ALL_GAMES: Game[] = [
  { id: "red", label: "Red", group: "red-blue", gen: 1 },
  { id: "blue", label: "Blue", group: "red-blue", gen: 1 },
  { id: "yellow", label: "Yellow", group: "yellow", gen: 1 },
  { id: "gold", label: "Gold", group: "gold-silver", gen: 2 },
  { id: "silver", label: "Silver", group: "gold-silver", gen: 2 },
  { id: "crystal", label: "Crystal", group: "crystal", gen: 2 },
  { id: "ruby", label: "Ruby", group: "ruby-sapphire", gen: 3 },
  { id: "sapphire", label: "Sapphire", group: "ruby-sapphire", gen: 3 },
  { id: "emerald", label: "Emerald", group: "emerald", gen: 3 },
  { id: "firered", label: "FireRed", group: "firered-leafgreen", gen: 3 },
  { id: "leafgreen", label: "LeafGreen", group: "firered-leafgreen", gen: 3 },
  { id: "diamond", label: "Diamond", group: "diamond-pearl", gen: 4 },
  { id: "pearl", label: "Pearl", group: "diamond-pearl", gen: 4 },
  { id: "platinum", label: "Platinum", group: "platinum", gen: 4 },
  {
    id: "heartgold",
    label: "HeartGold",
    group: "heartgold-soulsilver",
    gen: 4,
  },
  {
    id: "soulsilver",
    label: "SoulSilver",
    group: "heartgold-soulsilver",
    gen: 4,
  },
  { id: "black", label: "Black", group: "black-white", gen: 5 },
  { id: "white", label: "White", group: "black-white", gen: 5 },
  { id: "black-2", label: "Black 2", group: "black-2-white-2", gen: 5 },
  { id: "white-2", label: "White 2", group: "black-2-white-2", gen: 5 },
  { id: "x", label: "X", group: "x-y", gen: 6 },
  { id: "y", label: "Y", group: "x-y", gen: 6 },
  {
    id: "omega-ruby",
    label: "Omega Ruby",
    group: "omega-ruby-alpha-sapphire",
    gen: 6,
  },
  {
    id: "alpha-sapphire",
    label: "Alpha Sapphire",
    group: "omega-ruby-alpha-sapphire",
    gen: 6,
  },
  { id: "sun", label: "Sun", group: "sun-moon", gen: 7 },
  { id: "moon", label: "Moon", group: "sun-moon", gen: 7 },
  {
    id: "ultra-sun",
    label: "Ultra Sun",
    group: "ultra-sun-ultra-moon",
    gen: 7,
  },
  {
    id: "ultra-moon",
    label: "Ultra Moon",
    group: "ultra-sun-ultra-moon",
    gen: 7,
  },
  {
    id: "lets-go-pikachu",
    label: "Let's Go, Pikachu!",
    group: "lets-go-pikachu-lets-go-eevee",
    gen: 7,
  },
  {
    id: "lets-go-eevee",
    label: "Let's Go, Eevee!",
    group: "lets-go-pikachu-lets-go-eevee",
    gen: 7,
  },
  { id: "sword", label: "Sword", group: "sword-shield", gen: 8 },
  { id: "shield", label: "Shield", group: "sword-shield", gen: 8 },
  {
    id: "brilliant-diamond",
    label: "Brilliant Diamond",
    group: "brilliant-diamond-shining-pearl",
    gen: 8,
  },
  {
    id: "shining-pearl",
    label: "Shining Pearl",
    group: "brilliant-diamond-shining-pearl",
    gen: 8,
  },
  {
    id: "legends-arceus",
    label: "Legends: Arceus",
    group: "legends-arceus",
    gen: 8,
  },
  { id: "scarlet", label: "Scarlet", group: "scarlet-violet", gen: 9 },
  { id: "violet", label: "Violet", group: "scarlet-violet", gen: 9 },
  { id: "legends-za", label: "Legends: Z-A", group: "legends-za", gen: 9 },
];

/** Grupos de versiones de la API en orden cronológico, sin repetidos. */
export const GROUP_ORDER = [...new Set(ALL_GAMES.map((g) => g.group))];

/** Juegos con datos de Pokémon disponibles (los que se pueden elegir en el Team Planner). */
export const GAMES = ALL_GAMES.filter(
  (g) => (GAME_POKEMON[g.group] ?? []).length > 0,
);

/** Índice de juegos por id. */
export const GAME_BY_ID = new Map(GAMES.map((g) => [g.id, g]));

/** Generaciones con al menos un juego, para agrupar el selector. */
export const GENERATIONS = [...new Set(GAMES.map((g) => g.gen))];

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
/** Etiqueta de una generación: 4 → "Gen IV". */
export const genLabel = (gen: number) => `Gen ${ROMAN[gen] ?? gen}`;

// ── Colores de cada juego (para las etiquetas) ─────────────────

/** Colores de la etiqueta de un juego. */
export interface GameColor {
  /** Fondo. */
  bg: string;
  /** Texto. */
  fg: string;
  /** Borde, solo para fondos casi blancos. */
  border?: string;
}

/** Color de cada versión, basado en su portada. */
const GAME_COLORS: Record<string, GameColor> = {
  red: { bg: "#e3350d", fg: "#ffffff" },
  blue: { bg: "#2e6fd8", fg: "#ffffff" },
  yellow: { bg: "#ffcb05", fg: "#3b2f00" },
  gold: { bg: "#d4af37", fg: "#3b2f00" },
  silver: { bg: "#c0c0c8", fg: "#1f2937" },
  crystal: { bg: "#7fd3e8", fg: "#0c3b47" },
  ruby: { bg: "#c1121f", fg: "#ffffff" },
  sapphire: { bg: "#1f4fbf", fg: "#ffffff" },
  emerald: { bg: "#149e5a", fg: "#ffffff" },
  firered: { bg: "#e8541e", fg: "#ffffff" },
  leafgreen: { bg: "#4caf50", fg: "#ffffff" },
  diamond: { bg: "#8ec5ff", fg: "#0b3360" },
  pearl: { bg: "#f4b6c8", fg: "#6b1f3a" },
  platinum: { bg: "#8e8e99", fg: "#ffffff" },
  heartgold: { bg: "#e0b33c", fg: "#3b2f00" },
  soulsilver: { bg: "#b8c2cc", fg: "#1f2937" },
  black: { bg: "#222222", fg: "#ffffff" },
  white: { bg: "#ffffff", fg: "#374151", border: "#d1d5db" },
  "black-2": { bg: "#2b2f3a", fg: "#ffffff" },
  "white-2": { bg: "#f8e8ec", fg: "#7a2340", border: "#f0c9d3" },
  x: { bg: "#1e63b5", fg: "#ffffff" },
  y: { bg: "#c8102e", fg: "#ffffff" },
  "omega-ruby": { bg: "#a3121a", fg: "#ffffff" },
  "alpha-sapphire": { bg: "#1a3e9e", fg: "#ffffff" },
  sun: { bg: "#f28c28", fg: "#ffffff" },
  moon: { bg: "#6c4ab6", fg: "#ffffff" },
  "ultra-sun": { bg: "#e86a1a", fg: "#ffffff" },
  "ultra-moon": { bg: "#8e3fbf", fg: "#ffffff" },
  "lets-go-pikachu": { bg: "#ffd733", fg: "#3b2f00" },
  "lets-go-eevee": { bg: "#b07a45", fg: "#ffffff" },
  sword: { bg: "#1ca7e0", fg: "#ffffff" },
  shield: { bg: "#d6336c", fg: "#ffffff" },
  "brilliant-diamond": { bg: "#3d7fd9", fg: "#ffffff" },
  "shining-pearl": { bg: "#e58fb0", fg: "#ffffff" },
  "legends-arceus": { bg: "#8c6d3b", fg: "#ffffff" },
  scarlet: { bg: "#e2402f", fg: "#ffffff" },
  violet: { bg: "#7b3fb3", fg: "#ffffff" },
  "legends-za": { bg: "#1e9e6a", fg: "#ffffff" },
};

/** Color para un juego sin entrada en `GAME_COLORS`. */
const DEFAULT_COLOR: GameColor = { bg: "#e5e7eb", fg: "#374151" };

/** Colores de la etiqueta de un juego. */
export const gameColor = (game: Game) => GAME_COLORS[game.id] ?? DEFAULT_COLOR;

// ── Imágenes del Team Planner ─────────────────

/** Grupos de Switch: no tienen íconos de PC pixelados, así que se usa el arte oficial. */
const ARTWORK_GROUPS = new Set([
  "lets-go-pikachu-lets-go-eevee",
  "sword-shield",
  "brilliant-diamond-shining-pearl",
  "legends-arceus",
  "scarlet-violet",
  "legends-za",
]);

/** Indica si el juego usa arte oficial en lugar de sprites pixelados. */
export const usesArtwork = (game: Game) => ARTWORK_GROUPS.has(game.group);

/** Imagen grande (casilleros, panel): sprite pixelado o arte oficial, según el juego. */
export const teamSpriteUrl = (id: number, game: Game) =>
  usesArtwork(game) ? artworkUrl(id) : pokemonSpriteUrl(id);

/** Estilo `image-rendering: pixelated` para sprites pixelados; ninguno para arte. */
export const spriteStyle = (pixel: boolean) =>
  pixel ? { imageRendering: "pixelated" as const } : undefined;
