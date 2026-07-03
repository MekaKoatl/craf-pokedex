import { useQuery } from '@tanstack/react-query'
import { getPokemonFull, getSpecies, getEvolutionChain } from '../lib/api'
import { REGIONAL_SUFFIX_LIST } from '../lib/constants'

export function usePokemonDetails(id: string) {
  return useQuery({
    queryKey: ['details', id],
    queryFn: async () => {
      const pokemon = await getPokemonFull(id)

      const suffix = REGIONAL_SUFFIX_LIST.find((s) => pokemon.name.endsWith(s))
      const isRegional = Boolean(suffix)
      const speciesName = isRegional ? pokemon.name.replace(suffix!, '') : pokemon.name

      const species = await getSpecies(speciesName)
      const evoChain = await getEvolutionChain(species.evolution_chain.url)

      return { pokemon, species, evoChain, isRegional, suffix, speciesName }
    },
  })
}