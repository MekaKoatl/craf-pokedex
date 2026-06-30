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

export async function fetchInBatches<T, R>(
  items: T[],
  fetchFn: (item: T) => Promise<R>,
  batchSize = 20
): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(fetchFn))
    results.push(...batchResults)
  }
  return results
}