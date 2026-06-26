import { BASE_URL } from './constants'
import type { Pokemon } from '../types/pokemon'

// Lanza error si no existe (lo usará React Query)
export async function getPokemon(nameOrId: string | number): Promise<Pokemon> {
  const res = await fetch(`${BASE_URL}/pokemon/${nameOrId}`)
  if (!res.ok) throw new Error('Pokemon not found')
  return res.json()
}

// Devuelve null si no existe (lo usaremos para cargar grids en lote)
export async function fetchPokemonById(id: string | number): Promise<Pokemon | null> {
  const res = await fetch(`${BASE_URL}/pokemon/${id}`)
  if (!res.ok) return null
  return res.json()
}