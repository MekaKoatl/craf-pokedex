import { TOTAL_POKEMON } from './constants'

const MIN_GAP = 25 // distancia mínima entre ids de días cercanos
const WINDOW = 7 // cuántos días atrás se revisan

// Fecha local como "2026-10-14"
export function getTodayKey(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

// Generador de números aleatorios con semilla (mulberry32).
// Misma semilla → siempre la misma secuencia.
function makeRandom(seed: number) {
  return function () {
    seed = (seed + 0x6d2b79f5) >>> 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ¿Este candidato está lo bastante lejos de los de la semana previa?
function isFarEnough(ids: number[], pos: number, candidate: number): boolean {
  for (let k = Math.max(0, pos - WINDOW); k < pos; k++) {
    if (Math.abs(ids[k] - candidate) < MIN_GAP) return false
  }
  return true
}

// Baraja los 1025 ids con el año como semilla y separa los que quedan muy juntos
function buildYearOrder(year: number): number[] {
  const rand = makeRandom((year * 2654435761) >>> 0)
  const ids = Array.from({ length: TOTAL_POKEMON }, (_, i) => i + 1)

  // Fisher-Yates: el barajado estándar
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }

  // Reparación: si un id quedó cerca de otro de su misma semana,
  // se intercambia por uno más adelante que sí cumpla
  for (let i = 1; i < ids.length; i++) {
    if (isFarEnough(ids, i, ids[i])) continue
    for (let j = i + 1; j < ids.length; j++) {
      if (isFarEnough(ids, i, ids[j])) {
        ;[ids[i], ids[j]] = [ids[j], ids[i]]
        break
      }
    }
  }

  return ids
}

// Día del año, 0 = 1 de enero
function getDayOfYear(d: Date): number {
  const inicio = new Date(d.getFullYear(), 0, 1)
  const hoy = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round((hoy.getTime() - inicio.getTime()) / 86400000)
}

// El barajado se calcula una sola vez por año
let cachedYear = -1
let cachedOrder: number[] = []

export function getDailyPokemonId(date = new Date()): number {
  const year = date.getFullYear()
  if (year !== cachedYear) {
    cachedOrder = buildYearOrder(year)
    cachedYear = year
  }
  return cachedOrder[getDayOfYear(date)]
}

// Milisegundos hasta la próxima medianoche local
export function msUntilMidnight(): number {
  const ahora = new Date()
  const siguiente = new Date(ahora)
  siguiente.setHours(24, 0, 0, 0)
  return siguiente.getTime() - ahora.getTime()
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = String(Math.floor(total / 3600)).padStart(2, '0')
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
}

