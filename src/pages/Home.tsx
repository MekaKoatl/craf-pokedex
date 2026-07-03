import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Carousel } from '../components/Carousel'
import { useFilters } from '../hooks/useFilters'
import { useFilteredPokemon } from '../hooks/useFilteredPokemon'
import { usePokemonNames } from '../hooks/usePokemonNames'
import { useSearchPokemon } from '../hooks/useSearchPokemon'
import { FilterBar } from '../components/filters/FilterBar'
import { SearchBar } from '../components/SearchBar'
import { DexCard } from '../components/DexCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { fetchPokemonById } from '../lib/api'
import type { Pokemon } from '../types/pokemon'

export function Home() {
  const { filters, toggle, clearGroup, clearAll, hasAnyActive } = useFilters()
  const [search, setSearch] = useState('')

  const { data: allNames = [] } = usePokemonNames()
  const searchResults = useSearchPokemon(search, allNames)
  const filtered = useFilteredPokemon(filters, hasAnyActive)

  const initial = useQuery({
    queryKey: ['home-initial'],
    queryFn: async () => {
      const ids = Array.from({ length: 15 }, (_, i) => i + 1)
      const results = await Promise.all(ids.map(fetchPokemonById))
      return results.filter((p): p is Pokemon => p !== null)
    },
    staleTime: Infinity,
  })

  const isSearching = search.length > 0

  return (
    <div>
      <Carousel />
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Pokedex Search</h2>

        <FilterBar filters={filters} toggle={toggle} clearGroup={clearGroup} clearAll={clearAll} />
        <SearchBar onSearch={setSearch} />

        {isSearching ? (
          searchResults.isLoading ? (
            <LoadingSpinner text="Searching..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(searchResults.data ?? []).length === 0 ? (
                <p className="text-gray-400 col-span-full text-center py-8">No Pokémon found.</p>
              ) : (
                searchResults.data!.map((p) => <DexCard key={p.id} pokemon={p} />)
              )}
            </div>
          )
        ) : hasAnyActive ? (
          filtered.isLoading ? (
            <LoadingSpinner text="Filtering..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(filtered.data ?? []).length === 0 ? (
                <p className="text-gray-400 col-span-full text-center py-8">No Pokémon found.</p>
              ) : (
                filtered.data!.map((p) => <DexCard key={p.id} pokemon={p} />)
              )}
            </div>
          )
        ) : initial.isLoading ? (
          <LoadingSpinner text="Loading..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(initial.data ?? []).map((p) => <DexCard key={p.id} pokemon={p} />)}
          </div>
        )}
      </section>
    </div>
  )
}