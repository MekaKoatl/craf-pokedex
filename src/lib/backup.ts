import { MAX_LISTS, type PokemonList } from "../context/ListsContext";
import {
  MAX_TEAMS,
  TEAM_SIZE,
  type Team,
  type TeamMember,
} from "../context/TeamsContext";
import { GAME_BY_ID } from "./games";

/** Identifica los archivos de backup de este sitio. */
const BACKUP_APP = "craf-pokedex";

/** Versión del formato del archivo. Subirla si cambia la estructura. */
const BACKUP_VERSION = 1;

/** Largo máximo de los nombres de listas y equipos (igual que en el formulario). */
const MAX_NAME_LENGTH = 40;

/** Partes del backup que se pueden exportar e importar por separado. */
export type BackupSection = "favorites" | "lists" | "teams";

/** Secciones en el orden en que se muestran, con su texto visible. */
export const BACKUP_SECTIONS: { key: BackupSection; label: string }[] = [
  { key: "favorites", label: "Favorites" },
  { key: "lists", label: "Lists" },
  { key: "teams", label: "Teams" },
];

/** Datos del usuario que entran en un backup. */
export interface BackupData {
  favorites: number[];
  lists: PokemonList[];
  teams: Team[];
}

/** Contenido de un archivo de backup. Cada sección es opcional. */
export interface BackupFile extends Partial<BackupData> {
  app: string;
  version: number;
  /** Fecha y hora de exportación, en formato ISO. */
  exportedAt: string;
}

/** Arma el contenido del archivo con las secciones elegidas. */
export function buildBackup(
  data: BackupData,
  include: BackupSection[],
): BackupFile {
  const file: BackupFile = {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
  };
  for (const key of include) {
    (file as unknown as Record<BackupSection, unknown>)[key] = data[key];
  }
  return file;
}

/** Nombre del archivo descargado: "craf-pokedex-backup-2026-11-23.json". */
export function backupFileName(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `${BACKUP_APP}-backup-${day}.json`;
}

// ── Lectura y validación ─────────────────────────────

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isPokemonId = (v: unknown): v is number =>
  Number.isInteger(v) && (v as number) > 0;

/** Nombre limpio y recortado, o null si no es un texto con contenido. */
function cleanName(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const name = v.trim().slice(0, MAX_NAME_LENGTH);
  return name || null;
}

const stringOrNull = (v: unknown) => (typeof v === "string" ? v : null);

/** Tupla de 6 números, o undefined si el valor no tiene esa forma. */
function statTuple(v: unknown): TeamMember["evs"] {
  return Array.isArray(v) &&
    v.length === 6 &&
    v.every((n) => typeof n === "number")
    ? (v as TeamMember["evs"])
    : undefined;
}

function readFavorites(v: unknown): number[] {
  return Array.isArray(v) ? [...new Set(v.filter(isPokemonId))] : [];
}

function readList(v: unknown): PokemonList | null {
  if (!isObject(v)) return null;
  const name = cleanName(v.name);
  if (!name) return null;
  return {
    id: typeof v.id === "string" ? v.id : crypto.randomUUID(),
    name,
    pokemon: readFavorites(v.pokemon),
  };
}

function readMember(v: unknown): TeamMember | null {
  if (!isObject(v) || !isPokemonId(v.pokemonId)) return null;
  const member: TeamMember = {
    pokemonId: v.pokemonId,
    ability: stringOrNull(v.ability),
    item: stringOrNull(v.item),
    nature: stringOrNull(v.nature),
    moves: Array.isArray(v.moves)
      ? v.moves.filter((m) => typeof m === "string").slice(0, 4)
      : [],
  };
  if (Number.isInteger(v.level)) member.level = v.level as number;
  const evs = statTuple(v.evs);
  if (evs) member.evs = evs;
  const ivs = statTuple(v.ivs);
  if (ivs) member.ivs = ivs;
  return member;
}

function readTeam(v: unknown): Team | null {
  if (!isObject(v)) return null;
  const name = cleanName(v.name);
  if (!name || typeof v.game !== "string" || !GAME_BY_ID.has(v.game))
    return null;
  const members = Array.isArray(v.members)
    ? v.members
        .map(readMember)
        .filter((m): m is TeamMember => m !== null)
        .slice(0, TEAM_SIZE)
    : [];
  return {
    id: typeof v.id === "string" ? v.id : crypto.randomUUID(),
    name,
    game: v.game,
    members,
  };
}

/** Resultado de leer un archivo: los datos válidos y avisos de lo descartado. */
export interface ParsedBackup {
  data: Partial<BackupData>;
  notes: string[];
}

/**
 * Lee y valida el texto de un archivo de backup. Descarta las entradas
 * inválidas (y lo avisa en `notes`) en lugar de rechazar todo el archivo.
 *
 * @throws {Error} Si el texto no es un backup de este sitio.
 */
export function parseBackup(text: string): ParsedBackup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("The file is not valid JSON.");
  }
  if (!isObject(raw) || raw.app !== BACKUP_APP)
    throw new Error("This is not a MekaDragon's Pokédex backup file.");
  if (typeof raw.version !== "number" || raw.version > BACKUP_VERSION)
    throw new Error("This backup was made with a newer version of the site.");

  const data: Partial<BackupData> = {};
  const notes: string[] = [];

  if (raw.favorites !== undefined)
    data.favorites = readFavorites(raw.favorites);

  if (raw.lists !== undefined) {
    const all = Array.isArray(raw.lists) ? raw.lists : [];
    data.lists = all.map(readList).filter((l): l is PokemonList => l !== null);
    const bad = all.length - data.lists.length;
    if (bad > 0) notes.push(`${bad} invalid list(s) were skipped.`);
  }

  if (raw.teams !== undefined) {
    const all = Array.isArray(raw.teams) ? raw.teams : [];
    data.teams = all.map(readTeam).filter((t): t is Team => t !== null);
    const bad = all.length - data.teams.length;
    if (bad > 0) notes.push(`${bad} invalid team(s) were skipped.`);
  }

  return { data, notes };
}

// ── Aplicar un backup ─────────────────────────────

/** Cómo se aplica un backup sobre los datos existentes. */
export type ImportMode = "merge" | "replace";

const sameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * Calcula los datos resultantes de importar un backup, sin modificar nada.
 * Solo se tocan las secciones de `include` que el archivo trae.
 *
 * - **replace:** las secciones elegidas quedan iguales a las del archivo
 *   (recortadas a los máximos de listas y equipos).
 * - **merge:** los favoritos se suman; una lista con el mismo nombre que una
 *   existente suma sus Pokémon a esa lista; un equipo con el mismo nombre
 *   se omite. Lo que supere los máximos se omite.
 *
 * @returns Los datos finales y un aviso por cada cosa omitida o recortada.
 */
export function applyBackup(
  current: BackupData,
  incoming: Partial<BackupData>,
  include: BackupSection[],
  mode: ImportMode,
): { result: BackupData; notes: string[] } {
  const result: BackupData = {
    favorites: current.favorites,
    lists: current.lists,
    teams: current.teams,
  };
  const notes: string[] = [];
  const wants = (key: BackupSection) =>
    include.includes(key) && incoming[key] !== undefined;

  if (wants("favorites")) {
    const inc = incoming.favorites!;
    result.favorites =
      mode === "replace"
        ? inc
        : [
            ...current.favorites,
            ...inc.filter((id) => !current.favorites.includes(id)),
          ];
  }

  if (wants("lists")) {
    const inc = incoming.lists!;
    if (mode === "replace") {
      result.lists = inc.slice(0, MAX_LISTS);
    } else {
      const lists = current.lists.map((l) => ({ ...l }));
      for (const l of inc) {
        const match = lists.find((x) => sameName(x.name, l.name));
        if (match) {
          match.pokemon = [
            ...match.pokemon,
            ...l.pokemon.filter((id) => !match.pokemon.includes(id)),
          ];
        } else if (lists.length < MAX_LISTS) {
          lists.push({ ...l, id: crypto.randomUUID() });
        } else {
          notes.push(`List "${l.name}" was skipped: limit of ${MAX_LISTS}.`);
        }
      }
      result.lists = lists;
    }
    if (mode === "replace" && inc.length > MAX_LISTS)
      notes.push(`Only the first ${MAX_LISTS} lists were imported.`);
  }

  if (wants("teams")) {
    const inc = incoming.teams!;
    if (mode === "replace") {
      result.teams = inc.slice(0, MAX_TEAMS);
      if (inc.length > MAX_TEAMS)
        notes.push(`Only the first ${MAX_TEAMS} teams were imported.`);
    } else {
      const teams = [...current.teams];
      for (const t of inc) {
        if (teams.some((x) => sameName(x.name, t.name))) {
          notes.push(`Team "${t.name}" was skipped: the name already exists.`);
        } else if (teams.length < MAX_TEAMS) {
          teams.push({ ...t, id: crypto.randomUUID() });
        } else {
          notes.push(`Team "${t.name}" was skipped: limit of ${MAX_TEAMS}.`);
        }
      }
      result.teams = teams;
    }
  }

  return { result, notes };
}