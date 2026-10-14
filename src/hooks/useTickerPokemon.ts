import { useQuery } from '@tanstack/react-query'
import { fetchPokemonById } from '../lib/api'
import { getRandomPokemonId } from '../lib/regional'
import type { Pokemon } from '../types/pokemon'

const TICKER_SIZE = 50

export function useTickerPokemon() {
  return useQuery({
    queryKey: ['ticker-pool'],
    queryFn: async () => {
      // Set para evitar repetidos
      const ids = new Set<number>()
      while (ids.size < TICKER_SIZE) ids.add(getRandomPokemonId())

      const results = await Promise.all([...ids].map(fetchPokemonById))
      return results.filter((p): p is Pokemon => p !== null)
    },
    staleTime: Infinity, // no recargar el pool
  })
}