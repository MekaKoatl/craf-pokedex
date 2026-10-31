import { GAME_POKEMON } from "../data/pokemon-games";

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
