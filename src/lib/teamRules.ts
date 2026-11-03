import type { NamedResource, PokemonFull } from "../types/pokemon";
import type { Move } from "../types/move";
import { GROUP_ORDER, type Game } from "./games";
import { HELD_ITEMS } from "../data/held-items";
import { prettyName } from "./text";

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
export const genNumber = (name: string) => GEN_NUM[name] ?? 0;

export interface AbilityOption {
  name: string;
  hidden: boolean;
}

// Las habilidades que tenía el Pokémon en una generación
export function abilitiesForGame(p: PokemonFull, gen: number): AbilityOption[] {
  // Se arranca con las de hoy, una por casillero
  const bySlot = new Map<
    number,
    { ability: NamedResource | null; is_hidden: boolean }
  >(p.abilities.map((a) => [a.slot, a]));

  // Se aplican los cambios que valen para esta generación, de la entrada
  // más nueva a la más vieja: así la más cercana al juego queda al final
  const past = (p.past_abilities ?? [])
    .filter((e) => genNumber(e.generation.name) >= gen)
    .sort(
      (a, b) => genNumber(b.generation.name) - genNumber(a.generation.name),
    );
  for (const e of past) for (const a of e.abilities) bySlot.set(a.slot, a);

  return [...bySlot.entries()]
    .sort((a, b) => a[0] - b[0])
    .flatMap(([, a]) =>
      // Sin habilidad en ese casillero, o oculta antes de que existieran
      !a.ability || (a.is_hidden && gen < 5)
        ? []
        : [{ name: a.ability.name, hidden: a.is_hidden }],
    );
}

// Los tipos que tenía el Pokémon en una generación.
// Vale la entrada más cercana que siga vigente en esa generación.
export function typesForGame(p: PokemonFull, gen: number): string[] {
  const past = (p.past_types ?? [])
    .filter((e) => genNumber(e.generation.name) >= gen)
    .sort(
      (a, b) => genNumber(a.generation.name) - genNumber(b.generation.name),
    )[0];
  return (past?.types ?? p.types).map((t) => t.type.name);
}

// ── Naturalezas ───────────────────────────────
type Stat = "atk" | "def" | "spa" | "spd" | "spe";

const STAT_LABEL: Record<Stat, string> = {
  atk: "Atk",
  def: "Def",
  spa: "SpA",
  spd: "SpD",
  spe: "Spe",
};

export interface Nature {
  name: string;
  up: Stat | null; // el stat que sube un 10%
  down: Stat | null; // el que baja un 10%
}

// Ordenadas por nombre. Las neutras no cambian nada.
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

// "Adamant (+Atk, −SpA)" o "Hardy (neutral)"
export function natureLabel(n: Nature): string {
  const name = n.name.charAt(0).toUpperCase() + n.name.slice(1);
  return n.up && n.down
    ? `${name} (+${STAT_LABEL[n.up]}, −${STAT_LABEL[n.down]})`
    : `${name} (neutral)`;
}

// ── Movimientos ───────────────────────────────

// Los que el Pokémon aprende en ese juego, por cualquier método
export function movesForGame(p: PokemonFull, group: string): string[] {
  return p.moves
    .filter((m) =>
      m.version_group_details.some((d) => d.version_group.name === group),
    )
    .map((m) => m.move.name)
    .sort((a, b) => a.localeCompare(b));
}

// Hasta Gen III, físico o especial dependía del tipo y no del movimiento
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

export interface MoveInGame {
  type: string;
  category: string; // physical, special o status
  power: number | null;
  accuracy: number | null;
}

// Cómo era el movimiento en ese juego
export function moveForGame(m: Move, game: Game): MoveInGame {
  const at = GROUP_ORDER.indexOf(game.group);

  // Los cambios que pasaron después de este juego, del más cercano al más lejano
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

  // Cada dato por separado: el primer cambio que lo menciona gana
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

// Los grupos del buscador, en orden. key = categoría de la API
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

// La API dice que existen en juegos posteriores, pero solo sirven en estos
const MEGA_GROUPS = new Set([
  "x-y",
  "omega-ruby-alpha-sapphire",
  "sun-moon",
  "ultra-sun-ultra-moon",
  "legends-za",
]);
const Z_GROUPS = new Set(["sun-moon", "ultra-sun-ultra-moon"]);

// "firium-z--held" → "Firium Z"
export const itemLabel = (name: string) =>
  prettyName(name.replace(/--held$/, ""));

// Categoría → objetos disponibles en ese juego, ordenados por nombre
export function itemsForGame(game: Game): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [name, [cat, gen]] of Object.entries(HELD_ITEMS)) {
    if (gen > game.gen) continue;
    if (cat === "mega-stones" && !MEGA_GROUPS.has(game.group)) continue;
    if (cat === "z-crystals" && !Z_GROUPS.has(game.group)) continue;
    // Desde X/Y, Exp. Share es un objeto clave y ya no se equipa
    if (name === "exp-share" && game.gen >= 6) continue;
    (out[cat] ??= []).push(name);
  }
  for (const list of Object.values(out))
    list.sort((a, b) => itemLabel(a).localeCompare(itemLabel(b)));
  return out;
}
// ── Megas ───────────────────────────────

// Si el objeto es la Megapiedra de esta especie, el nombre de su forma Mega.
// "charizard" + "charizardite-x" → "charizard-mega-x"
export function megaNameFor(
  speciesName: string,
  item: string | null,
): string | null {
  if (!item || HELD_ITEMS[item]?.[0] !== "mega-stones") return null;
  // La piedra tiene que ser de esta especie: "charizardite" empieza con "chari"
  if (!item.startsWith(speciesName.slice(0, 5))) return null;
  const letter = item.match(/-([xyz])$/)?.[1];
  return `${speciesName}-mega${letter ? `-${letter}` : ""}`;
}

// "charizard-mega-x" → "Mega Charizard X"
export function megaLabel(megaName: string): string {
  const [base, rest = ""] = megaName.split("-mega");
  const letter = rest.replace(/^-/, "").toUpperCase();
  return `Mega ${prettyName(base)}${letter ? ` ${letter}` : ""}`;
}

// Las Megapiedras de una especie que existen en ese juego.
// Usar solo con especies que tienen Mega (forms "M" en pokemon-data):
// por las 5 letras, Pidgey también "coincidiría" con Pidgeotite.
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

// "charizardite-x" → "Mega X" · "venusaurite" → "Mega"
export function megaStoneLabel(stone: string): string {
  const letter = stone.match(/-([xyz])$/)?.[1];
  return letter ? `Mega ${letter.toUpperCase()}` : "Mega";
}

// ── Stats ───────────────────────────────

export type StatTuple = [number, number, number, number, number, number];

// Mismo orden en todos lados: HP, Atk, Def, SpA, SpD, Spe
const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];
export const STAT_NAMES = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"];
const API_STATS = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];

export const DEFAULT_LEVEL = 50;
export const MAX_IV = 31;
export const MAX_EV = 252;
export const MAX_EV_TOTAL = 510;
export const DEFAULT_IVS: StatTuple = [31, 31, 31, 31, 31, 31];
export const EMPTY_EVS: StatTuple = [0, 0, 0, 0, 0, 0];

// Los 6 stats base de la API, en nuestro orden
export function baseStats(p: PokemonFull): StatTuple {
  return API_STATS.map(
    (n) => p.stats.find((s) => s.stat.name === n)?.base_stat ?? 0,
  ) as StatTuple;
}

// 1.1 si la naturaleza sube ese stat, 0.9 si lo baja. HP nunca cambia.
export function natureMultiplier(nature: string | null, i: number): number {
  const n = NATURES.find((x) => x.name === nature);
  if (!n || i === 0) return 1;
  if (n.up === STAT_KEYS[i]) return 1.1;
  if (n.down === STAT_KEYS[i]) return 0.9;
  return 1;
}

// Las fórmulas de los juegos (Gen III en adelante)
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
    // Shedinja (HP base 1) siempre tiene 1 de HP
    if (i === 0) return b === 1 ? 1 : core + level + 10;
    return Math.floor((core + 5) * natureMultiplier(nature, i));
  }) as StatTuple;
}

// Repartos de EVs comunes para los botones rápidos
export const EV_PRESETS: { label: string; evs: StatTuple }[] = [
  { label: "252 Atk / 252 Spe / 4 HP", evs: [4, 252, 0, 0, 0, 252] },
  { label: "252 SpA / 252 Spe / 4 HP", evs: [4, 0, 0, 252, 0, 252] },
  { label: "252 HP / 252 Def / 4 SpD", evs: [252, 0, 252, 0, 4, 0] },
  { label: "252 HP / 252 SpD / 4 Def", evs: [252, 0, 4, 0, 252, 0] },
  { label: "Clear", evs: [0, 0, 0, 0, 0, 0] },
];
