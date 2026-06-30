import { useQuery } from '@tanstack/react-query'
import { filterPokemonData } from '../lib/filterpokemon'
import { fetchPokemonById, fetchInBatches } from '../lib/api'
import type { FilterState } from './useFilters'
import type { Pokemon } from '../types/pokemon'

export function useFilteredPokemon(filters: FilterState, enabled: boolean) {
  return useQuery({
    queryKey: ['filtered-pokemon', filters],
    queryFn: async () => {
      const entries = filterPokemonData(filters)
      const results = await fetchInBatches(
        entries,
        (entry) => fetchPokemonById(entry.id),
        20
      )
      return results
        .filter((p): p is Pokemon => p !== null)
        .sort((a, b) => a.id - b.id)
    },
    enabled, // solo corre si hay filtros activos
  })
}