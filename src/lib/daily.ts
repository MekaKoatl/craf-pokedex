import { TOTAL_POKEMON } from './constants'

// Fecha local como "2026-10-13"
export function getTodayKey(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

// Convierte la fecha en un número estable: mismo día → mismo id
export function getDailyPokemonId(key = getTodayKey()): number {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return (hash % TOTAL_POKEMON) + 1
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