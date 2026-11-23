import { TOTAL_POKEMON } from "./constants";

/** Distancia mínima entre los ids de días cercanos. */
const MIN_GAP = 25;
/** Cantidad de días previos con los que se compara cada id. */
const WINDOW = 7;

/** Fecha local como clave "AAAA-MM-DD", p. ej. "2026-10-14". */
export function getTodayKey(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Generador pseudoaleatorio con semilla (mulberry32): la misma semilla da siempre la misma secuencia. */
function makeRandom(seed: number) {
  return function () {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Indica si el candidato está a más de `MIN_GAP` de los ids de los `WINDOW` días anteriores. */
function isFarEnough(ids: number[], pos: number, candidate: number): boolean {
  for (let k = Math.max(0, pos - WINDOW); k < pos; k++) {
    if (Math.abs(ids[k] - candidate) < MIN_GAP) return false;
  }
  return true;
}

/**
 * Orden de los Pokémon del día para un año: baraja todos los ids con el año
 * como semilla y separa los que quedan demasiado cerca de días previos.
 */
function buildYearOrder(year: number): number[] {
  const rand = makeRandom((year * 2654435761) >>> 0);
  const ids = Array.from({ length: TOTAL_POKEMON }, (_, i) => i + 1);

  // Barajado de Fisher-Yates
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }

  // Si un id quedó cerca de otro de los días previos, se intercambia
  // por uno posterior que cumpla la distancia mínima
  for (let i = 1; i < ids.length; i++) {
    if (isFarEnough(ids, i, ids[i])) continue;
    for (let j = i + 1; j < ids.length; j++) {
      if (isFarEnough(ids, i, ids[j])) {
        [ids[i], ids[j]] = [ids[j], ids[i]];
        break;
      }
    }
  }

  return ids;
}

/** Día del año, empezando en 0 (1 de enero). */
function getDayOfYear(d: Date): number {
  const inicio = new Date(d.getFullYear(), 0, 1);
  const hoy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((hoy.getTime() - inicio.getTime()) / 86400000);
}

// Caché del orden del año en curso
let cachedYear = -1;
let cachedOrder: number[] = [];

/**
 * Id del Pokémon del día. Es determinístico: todos los usuarios ven el mismo
 * Pokémon en la misma fecha local, y no se repite en el año.
 */
export function getDailyPokemonId(date = new Date()): number {
  const year = date.getFullYear();
  if (year !== cachedYear) {
    cachedOrder = buildYearOrder(year);
    cachedYear = year;
  }
  return cachedOrder[getDayOfYear(date)];
}

/** Milisegundos que faltan para la próxima medianoche local. */
export function msUntilMidnight(): number {
  const ahora = new Date();
  const siguiente = new Date(ahora);
  siguiente.setHours(24, 0, 0, 0);
  return siguiente.getTime() - ahora.getTime();
}

/** Formatea una duración en milisegundos como "HH:MM:SS". */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
