import type { NamedResource, PokemonFull } from "../types/pokemon";
import type { Move } from "../types/move";
import { GROUP_ORDER, type Game } from "./games";
import { HELD_ITEMS } from "../data/held-items";
import { prettyName } from "./text";

/** Número de cada generación según su nombre en la API. */
const GEN_NUM: Record<string, number> = {
  "generation-i": 1,
  "generation-ii": 2,
  "generation-iii": 3,
  "generation-iv": 4,
  "generation-v": 5,
  "generation-vi": 6,
  "generation-vii": 7,
  "generation-viii": 8,
  "generation-ix": 9,
};
/** Número de generación a partir del nombre de la API ("generation-iv" → 4), o 0. */
export const genNumber = (name: string) => GEN_NUM[name] ?? 0;

/** Una habilidad elegible y si es oculta. */
export interface AbilityOption {
  name: string;
  hidden: boolean;
}

/**
 * Habilidades que tenía un Pokémon en una generación. Parte de las actuales
 * y aplica los cambios históricos (`past_abilities`) vigentes en esa generación.
 * Las habilidades ocultas no existen antes de la Gen V.
 */
export function abilitiesForGame(p: PokemonFull, gen: number): AbilityOption[] {
  // Habilidades actuales, una por casillero
  const bySlot = new Map<
    number,
    { ability: NamedResource | null; is_hidden: boolean }
  >(p.abilities.map((a) => [a.slot, a]));

  // Se aplican las entradas históricas vigentes, de la más nueva a la más
  // vieja, para que prevalezca la más cercana a la generación pedida
  const past = (p.past_abilities ?? [])
    .filter((e) => genNumber(e.generation.name) >= gen)
    .sort(
      (a, b) => genNumber(b.generation.name) - genNumber(a.generation.name),
    );
  for (const e of past) for (const a of e.abilities) bySlot.set(a.slot, a);

  return [...bySlot.entries()]
    .sort((a, b) => a[0] - b[0])
    .flatMap(([, a]) =>
      // Casillero vacío en esa generación, u oculta antes de la Gen V
      !a.ability || (a.is_hidden && gen < 5)
        ? []
        : [{ name: a.ability.name, hidden: a.is_hidden }],
    );
}

/**
 * Tipos que tenía un Pokémon en una generación, según la entrada histórica
 * (`past_types`) más cercana que siga vigente; si no hay, los actuales.
 */
export function typesForGame(p: PokemonFull, gen: number): string[] {
  const past = (p.past_types ?? [])
    .filter((e) => genNumber(e.generation.name) >= gen)
    .sort(
      (a, b) => genNumber(a.generation.name) - genNumber(b.generation.name),
    )[0];
  return (past?.types ?? p.types).map((t) => t.type.name);
}

// ── Naturalezas ───────────────────────────────
/** Stats que una naturaleza puede modificar. */
type Stat = "atk" | "def" | "spa" | "spd" | "spe";

/** Abreviatura visible de cada stat. */
const STAT_LABEL: Record<Stat, string> = {
  atk: "Atk",
  def: "Def",
  spa: "SpA",
  spd: "SpD",
  spe: "Spe",
};

/** Una naturaleza y el stat que sube y baja (null en las neutras). */
export interface Nature {
  name: string;
  /** Stat que sube un 10%. */
  up: Stat | null;
  /** Stat que baja un 10%. */
  down: Stat | null;
}

/** Las 25 naturalezas, ordenadas por nombre. */
export const NATURES: Nature[] = [
  { name: "adamant", up: "atk", down: "spa" },
  { name: "bashful", up: null, down: null },
  { name: "bold", up: "def", down: "atk" },
  { name: "brave", up: "atk", down: "spe" },
  { name: "calm", up: "spd", down: "atk" },
  { name: "careful", up: "spd", down: "spa" },
  { name: "docile", up: null, down: null },
  { name: "gentle", up: "spd", down: "def" },
  { name: "hardy", up: null, down: null },
  { name: "hasty", up: "spe", down: "def" },
  { name: "impish", up: "def", down: "spa" },
  { name: "jolly", up: "spe", down: "spa" },
  { name: "lax", up: "def", down: "spd" },
  { name: "lonely", up: "atk", down: "def" },
  { name: "mild", up: "spa", down: "def" },
  { name: "modest", up: "spa", down: "atk" },
  { name: "naive", up: "spe", down: "spd" },
  { name: "naughty", up: "atk", down: "spd" },
  { name: "quiet", up: "spa", down: "spe" },
  { name: "quirky", up: null, down: null },
  { name: "rash", up: "spa", down: "spd" },
  { name: "relaxed", up: "def", down: "spe" },
  { name: "sassy", up: "spd", down: "spe" },
  { name: "serious", up: null, down: null },
  { name: "timid", up: "spe", down: "atk" },
];

/** Texto visible de una naturaleza: "Adamant (+Atk, −SpA)" o "Hardy (neutral)". */
export function natureLabel(n: Nature): string {
  const name = n.name.charAt(0).toUpperCase() + n.name.slice(1);
  return n.up && n.down
    ? `${name} (+${STAT_LABEL[n.up]}, −${STAT_LABEL[n.down]})`
    : `${name} (neutral)`;
}

// ── Movimientos ───────────────────────────────

/** Movimientos que el Pokémon aprende en un grupo de versiones, por cualquier método, ordenados por nombre. */
export function movesForGame(p: PokemonFull, group: string): string[] {
  return p.moves
    .filter((m) =>
      m.version_group_details.some((d) => d.version_group.name === group),
    )
    .map((m) => m.move.name)
    .sort((a, b) => a.localeCompare(b));
}

/** Tipos físicos hasta la Gen III, cuando la categoría dependía del tipo y no del movimiento. */
const PHYSICAL_TYPES = new Set([
  "normal",
  "fighting",
  "flying",
  "poison",
  "ground",
  "rock",
  "bug",
  "ghost",
  "steel",
]);

/** Datos de un movimiento tal como eran en un juego. */
export interface MoveInGame {
  type: string;
  /** physical, special o status. */
  category: string;
  power: number | null;
  accuracy: number | null;
}

/**
 * Tipo, categoría, potencia y precisión de un movimiento en un juego,
 * aplicando los cambios históricos (`past_values`) posteriores a ese juego.
 */
export function moveForGame(m: Move, game: Game): MoveInGame {
  const at = GROUP_ORDER.indexOf(game.group);

  // Cambios posteriores al juego, del más cercano al más lejano
  const later =
    at < 0
      ? []
      : (m.past_values ?? [])
          .map((pv) => ({
            pv,
            when: GROUP_ORDER.indexOf(pv.version_group.name),
          }))
          .filter((x) => x.when > at)
          .sort((a, b) => a.when - b.when)
          .map((x) => x.pv);

  // Cada dato toma el valor del primer cambio que lo menciona
  const type = later.find((pv) => pv.type)?.type?.name ?? m.type.name;
  const power = later.find((pv) => pv.power !== null)?.power ?? m.power;
  const accuracy =
    later.find((pv) => pv.accuracy !== null)?.accuracy ?? m.accuracy;

  const cls = m.damage_class.name;
  const category =
    cls !== "status" && game.gen <= 3
      ? PHYSICAL_TYPES.has(type)
        ? "physical"
        : "special"
      : cls;

  return { type, category, power, accuracy };
}

// ── Objetos ───────────────────────────────

/** Categorías de objetos equipables en el editor de equipos, en orden. `key` es la categoría de la API. */
export const ITEM_GROUPS = [
  { key: "choice", label: "Choice items" },
  { key: "held-items", label: "Held items" },
  { key: "bad-held-items", label: "Orbs & hindering items" },
  { key: "type-enhancement", label: "Type boosters" },
  { key: "plates", label: "Plates" },
  { key: "memories", label: "Memories" },
  { key: "jewels", label: "Gems" },
  { key: "species-specific", label: "Species-specific" },
  { key: "medicine", label: "Berries · Healing & status" },
  { key: "picky-healing", label: "Berries · HP (flavor)" },
  { key: "in-a-pinch", label: "Berries · In a pinch" },
  { key: "type-protection", label: "Berries · Type resist" },
  { key: "effort-drop", label: "Berries · EV reducing" },
  { key: "other", label: "Berries · Other" },
  { key: "training", label: "Training items" },
  { key: "effort-training", label: "EV training" },
  { key: "mega-stones", label: "Mega Stones" },
  { key: "z-crystals", label: "Z-Crystals" },
];

/** Juegos donde las Megapiedras tienen uso (la API las lista también en juegos posteriores). */
const MEGA_GROUPS = new Set([
  "x-y",
  "omega-ruby-alpha-sapphire",
  "sun-moon",
  "ultra-sun-ultra-moon",
  "legends-za",
]);
/** Juegos donde los Cristales Z tienen uso. */
const Z_GROUPS = new Set(["sun-moon", "ultra-sun-ultra-moon"]);

/** Nombre visible de un objeto: "firium-z--held" → "Firium Z". */
export const itemLabel = (name: string) =>
  prettyName(name.replace(/--held$/, ""));

/** Objetos equipables disponibles en un juego, por categoría y ordenados por nombre. */
export function itemsForGame(game: Game): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [name, [cat, gen]] of Object.entries(HELD_ITEMS)) {
    if (gen > game.gen) continue;
    if (cat === "mega-stones" && !MEGA_GROUPS.has(game.group)) continue;
    if (cat === "z-crystals" && !Z_GROUPS.has(game.group)) continue;
    // Desde X/Y, Exp. Share es un objeto clave y no se equipa
    if (name === "exp-share" && game.gen >= 6) continue;
    (out[cat] ??= []).push(name);
  }
  for (const list of Object.values(out))
    list.sort((a, b) => itemLabel(a).localeCompare(itemLabel(b)));
  return out;
}
// ── Megas ───────────────────────────────

/**
 * Nombre de la forma Mega si el objeto es una Megapiedra de la especie; si no, null.
 *
 * @example
 * megaNameFor("charizard", "charizardite-x"); // "charizard-mega-x"
 */
export function megaNameFor(
  speciesName: string,
  item: string | null,
): string | null {
  if (!item || HELD_ITEMS[item]?.[0] !== "mega-stones") return null;
  // La piedra debe corresponder a la especie: "charizardite" empieza con "chari"
  if (!item.startsWith(speciesName.slice(0, 5))) return null;
  const letter = item.match(/-([xyz])$/)?.[1];
  return `${speciesName}-mega${letter ? `-${letter}` : ""}`;
}

/** Nombre visible de una forma Mega: "charizard-mega-x" → "Mega Charizard X". */
export function megaLabel(megaName: string): string {
  const [base, rest = ""] = megaName.split("-mega");
  const letter = rest.replace(/^-/, "").toUpperCase();
  return `Mega ${prettyName(base)}${letter ? ` ${letter}` : ""}`;
}

/**
 * Megapiedras de una especie disponibles en un juego.
 * Usar solo con especies que tienen Mega (forma "M" en pokemon-data): la
 * coincidencia es por las primeras 5 letras, y Pidgey coincidiría con Pidgeotite.
 */
export function megaStonesFor(speciesName: string, game: Game): string[] {
  if (!MEGA_GROUPS.has(game.group)) return [];
  const prefix = speciesName.slice(0, 5);
  return Object.entries(HELD_ITEMS)
    .filter(
      ([name, [cat, gen]]) =>
        cat === "mega-stones" && gen <= game.gen && name.startsWith(prefix),
    )
    .map(([name]) => name)
    .sort();
}

/** Etiqueta corta de una Megapiedra: "charizardite-x" → "Mega X", "venusaurite" → "Mega". */
export function megaStoneLabel(stone: string): string {
  const letter = stone.match(/-([xyz])$/)?.[1];
  return letter ? `Mega ${letter.toUpperCase()}` : "Mega";
}

// ── Stats ───────────────────────────────

/** Los seis stats en orden: HP, Atk, Def, SpA, SpD, Spe. */
export type StatTuple = [number, number, number, number, number, number];

// Orden de stats usado en todo el proyecto: HP, Atk, Def, SpA, SpD, Spe
const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];
/** Abreviaturas visibles de los stats, en el orden de `StatTuple`. */
export const STAT_NAMES = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"];
const API_STATS = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];

/** Nivel predeterminado de un miembro nuevo. */
export const DEFAULT_LEVEL = 50;
/** Valores máximos de IV, EV por stat y EV totales. */
export const MAX_IV = 31;
export const MAX_EV = 252;
export const MAX_EV_TOTAL = 510;
/** IVs y EVs predeterminados de un miembro nuevo. */
export const DEFAULT_IVS: StatTuple = [31, 31, 31, 31, 31, 31];
export const EMPTY_EVS: StatTuple = [0, 0, 0, 0, 0, 0];

/** Stats base de un Pokémon, en el orden de `StatTuple`. */
export function baseStats(p: PokemonFull): StatTuple {
  return API_STATS.map(
    (n) => p.stats.find((s) => s.stat.name === n)?.base_stat ?? 0,
  ) as StatTuple;
}

/** Multiplicador de una naturaleza para el stat `i`: 1.1 si sube, 0.9 si baja, 1 si no cambia (HP siempre 1). */
export function natureMultiplier(nature: string | null, i: number): number {
  const n = NATURES.find((x) => x.name === nature);
  if (!n || i === 0) return 1;
  if (n.up === STAT_KEYS[i]) return 1.1;
  if (n.down === STAT_KEYS[i]) return 0.9;
  return 1;
}

/** Stats finales según las fórmulas de los juegos (Gen III en adelante). */
export function calcStats(
  base: StatTuple,
  ivs: StatTuple,
  evs: StatTuple,
  level: number,
  nature: string | null,
): StatTuple {
  return base.map((b, i) => {
    const core = Math.floor(
      ((2 * b + ivs[i] + Math.floor(evs[i] / 4)) * level) / 100,
    );
    // Shedinja (HP base 1) tiene siempre 1 HP
    if (i === 0) return b === 1 ? 1 : core + level + 10;
    return Math.floor((core + 5) * natureMultiplier(nature, i));
  }) as StatTuple;
}

/** Repartos de EVs habituales, para los botones rápidos del editor. */
export const EV_PRESETS: { label: string; evs: StatTuple }[] = [
  { label: "252 Atk / 252 Spe / 4 HP", evs: [4, 252, 0, 0, 0, 252] },
  { label: "252 SpA / 252 Spe / 4 HP", evs: [4, 0, 0, 252, 0, 252] },
  { label: "252 HP / 252 Def / 4 SpD", evs: [252, 0, 252, 0, 4, 0] },
  { label: "252 HP / 252 SpD / 4 Def", evs: [252, 0, 4, 0, 252, 0] },
  { label: "Clear", evs: [0, 0, 0, 0, 0, 0] },
];
