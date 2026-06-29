import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPokemonById } from '../lib/api'
import { POKEMON_DATA } from '../data/pokemon-data'
import { REGIONAL_SUFFIX_LIST } from '../lib/constants'
import type { Pokemon } from '../types/pokemon'

const BATCH_SIZE = 150

// Carga un lote de Pokémon e intercala sus formas regionales
async function fetchBatch(startId: number): Promise<Pokemon[]> {
  const ids = Array.from({ length: BATCH_SIZE }, (_, i) => startId + i)
  const pokemons = await Promise.all(ids.map(fetchPokemonById))
  const valid = pokemons.filter((p): p is Pokemon => p !== null)

  const regionalData = POKEMON_DATA.filter((e) => e.isRegional)
  const expanded: Pokemon[] = []

  for (const p of valid) {
    expanded.push(p)
    // Busca formas regionales cuyo nombre base coincida con este Pokémon
    const regionals = regionalData.filter((e) => {
      const suffix = REGIONAL_SUFFIX_LIST.find((s) => e.name.endsWith(s))
      const baseName = suffix ? e.name.replace(suffix, '') : null
      return baseName === p.name
    })
    for (const r of regionals) {
      const rp = await fetchPokemonById(r.id)
      if (rp) expanded.push(rp)
    }
  }
  return expanded
}

export function useDexGallery() {
  return useInfiniteQuery({
    queryKey: ['dex-gallery'],
    queryFn: ({ pageParam }) => fetchBatch(pageParam),
    initialPageParam: 1, //
    getNextPageParam: (_lastPage, allPages) => {
      // El siguiente lote
      const nextStart = allPages.length * BATCH_SIZE + 1
      return nextStart <= 1025 ? nextStart : undefined // undefined = no hay más
    },
  })
}