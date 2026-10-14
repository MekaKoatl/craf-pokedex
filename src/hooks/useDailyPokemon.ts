import { useQuery } from '@tanstack/react-query'
import { getPokemonFull, getSpecies } from '../lib/api'
import { getDailyPokemonId, getTodayKey } from '../lib/daily'

export function useDailyPokemon() {
  const id = getDailyPokemonId()

  return useQuery({
    queryKey: ['daily-pokemon', getTodayKey()],
    queryFn: async () => {
      const pokemon = await getPokemonFull(id)
      const species = await getSpecies(id)
      return { pokemon, species }
    },
    staleTime: Infinity,
  })
}