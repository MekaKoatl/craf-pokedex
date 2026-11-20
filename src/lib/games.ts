import { GAME_POKEMON } from "../data/pokemon-games";
import { artworkUrl, iconOrSprite, pokemonSpriteUrl } from "./sprites";

export interface Game {
  id: string; // la versión: "omega-ruby"
  label: string; // lo que ve el usuario: "Omega Ruby"
  group: string; // el grupo de la API: "omega-ruby-alpha-sapphire"
  gen: number;
}

// Lo que existe en cada juego. Lo que no exista, no se muestra en el equipo.
export interface GameFeatures {
  abilities: boolean;
  items: boolean;
  natures: boolean;
  fairy: boolean; // el tipo Hada existe desde Gen VI
}

const NONE = { abilities: false, items: false, natures: false };
const ALL = { abilities: true, items: true, natures: true };

// Solo los que se salen de lo normal; el resto tiene todo
const GROUP_FEATURES: Record<string, typeof ALL> = {
  "red-blue": NONE,
  yellow: NONE,
  "gold-silver": { ...NONE, items: true },
  crystal: { ...NONE, items: true },
  // Sin habilidades ni objetos equipados
  "lets-go-pikachu-lets-go-eevee": { ...NONE, natures: true },
  "legends-arceus": { ...NONE, natures: true },
};

export function gameFeatures(game: Game): GameFeatures {
  return { ...(GROUP_FEATURES[game.group] ?? ALL), fairy: game.gen >= 6 };
}

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

// Los grupos de la API en orden cronológico, sin repetir
export const GROUP_ORDER = [...new Set(ALL_GAMES.map((g) => g.group))];

// Solo los juegos que tienen datos de Pokémon
export const GAMES = ALL_GAMES.filter(
  (g) => (GAME_POKEMON[g.group] ?? []).length > 0,
);

export const GAME_BY_ID = new Map(GAMES.map((g) => [g.id, g]));

// Para agrupar el selector por generación
export const GENERATIONS = [...new Set(GAMES.map((g) => g.gen))];

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
export const genLabel = (gen: number) => `Gen ${ROMAN[gen] ?? gen}`;

// ── Colores de cada juego (para las etiquetas) ─────────────────

// bg: fondo, fg: texto. border solo hace falta si el fondo es casi blanco
export interface GameColor {
  bg: string;
  fg: string;
  border?: string;
}

// El color de la portada de cada versión
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

// Por si algún día se agrega un juego sin color
const DEFAULT_COLOR: GameColor = { bg: "#e5e7eb", fg: "#374151" };

export const gameColor = (game: Game) => GAME_COLORS[game.id] ?? DEFAULT_COLOR;

// ── Imágenes del Team Planner ─────────────────

// Juegos de Switch: ya no tienen íconos de PC pixel, se usa arte oficial
const ARTWORK_GROUPS = new Set([
  "lets-go-pikachu-lets-go-eevee",
  "sword-shield",
  "brilliant-diamond-shining-pearl",
  "legends-arceus",
  "scarlet-violet",
  "legends-za",
]);

export const usesArtwork = (game: Game) => ARTWORK_GROUPS.has(game.group);

// Imagen chica (caja, tarjetas): ícono de PC o arte
export const teamIconUrl = (id: number, game?: Game) =>
  game && usesArtwork(game) ? artworkUrl(id) : iconOrSprite(id);

// Imagen grande (casilleros, panel): sprite pixel o arte
export const teamSpriteUrl = (id: number, game: Game) =>
  usesArtwork(game) ? artworkUrl(id) : pokemonSpriteUrl(id);

// El estilo "pixelated" solo queda bien en sprites pixel
export const spriteStyle = (pixel: boolean) =>
  pixel ? { imageRendering: "pixelated" as const } : undefined;
