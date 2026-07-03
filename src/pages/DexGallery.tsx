import { useState } from 'react'
import { useFilters } from '../hooks/useFilters'
import { useFilteredPokemon } from '../hooks/useFilteredPokemon'
import { useDexGallery } from '../hooks/useDexGallery'
import { usePokemonNames } from '../hooks/usePokemonNames'
import { useSearchPokemon } from '../hooks/useSearchPokemon'
import { FilterBar } from '../components/filters/FilterBar'
import { SearchBar } from '../components/SearchBar'
import { DexCard } from '../components/DexCard'
import { LoadingSpinner } from '../components/LoadingSpinner'

export function DexGallery() {
  const { filters, toggle, clearGroup, clearAll, hasAnyActive } = useFilters()
  const [search, setSearch] = useState('')

  const { data: allNames = [] } = usePokemonNames()
  const searchResults = useSearchPokemon(search, allNames)
  const gallery = useDexGallery()
  const filtered = useFilteredPokemon(filters, hasAnyActive)

  const isSearching = search.length > 0

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <SearchBar onSearch={setSearch} />
      <FilterBar
        filters={filters}
        toggle={toggle}
        clearGroup={clearGroup}
        clearAll={clearAll}
        showEvoAndForms
      />

      {isSearching ? (
        searchResults.isLoading ? (
          <LoadingSpinner text="Searching..." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {(filtered.data ?? []).length === 0 ? (
              <p className="text-gray-400 col-span-full text-center py-8">No Pokémon found.</p>
            ) : (
              filtered.data!.map((p) => <DexCard key={p.id} pokemon={p} />)
            )}
          </div>
        )
      ) : gallery.isLoading ? (
        <LoadingSpinner text="Loading Pokédex..." />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {(gallery.data?.pages.flat() ?? []).map((p, i) => (
              <DexCard key={`${p.id}-${i}`} pokemon={p} />
            ))}
          </div>
          <div className="flex justify-center mt-8">
            {gallery.hasNextPage && (
              <button
                onClick={() => gallery.fetchNextPage()}
                disabled={gallery.isFetchingNextPage}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {gallery.isFetchingNextPage ? 'Loading...' : 'Load More'}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  )
}