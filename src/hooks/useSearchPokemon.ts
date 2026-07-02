import { useQuery } from '@tanstack/react-query'
import { matchNames } from '../lib/searchNames'
import { fetchPokemonById } from '../lib/api'
import type { Pokemon } from '../types/pokemon'

export function useSearchPokemon(query: string, allNames: string[]) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
  // Si es un número, busca por id directo
  if (/^\d+$/.test(query)) {
    const p = await fetchPokemonById(query)
    return p ? [p] : []
  }
  // Si no, búsqueda por nombre
  const matches = matchNames(allNames, query)
  const results = await Promise.all(matches.map((n) => fetchPokemonById(n)))
  return results.filter((p): p is Pokemon => p !== null).sort((a, b) => a.id - b.id)
},
    enabled: query.length > 0,
  })
}