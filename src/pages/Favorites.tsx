import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFavorites } from '../hooks/useFavorites'
import { useFilters } from '../hooks/useFilters'
import { FilterBar } from '../components/filters/FilterBar'
import { fetchPokemonById } from '../lib/api'
import { getRegionalDisplayName } from '../lib/regional'
import { POKEMON_DATA } from '../data/pokemon-data'
import { DexCard } from '../components/DexCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import type { Pokemon } from '../types/pokemon'

const GEN_TO_REGION: Record<number, string> = {
  1: 'kanto', 2: 'johto', 3: 'hoenn', 4: 'sinnoh', 5: 'unova',
  6: 'kalos', 7: 'alola', 8: 'galar', 9: 'paldea',
}

export function Favorites() {
  const { favorites, clearFavorites } = useFavorites()
  const { filters, toggle, clearGroup, clearAll } = useFilters()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['favorites', favorites],
    queryFn: async () => {
      const results = await Promise.all(favorites.map((id) => fetchPokemonById(id)))
      return results.filter((p): p is Pokemon => p !== null).sort((a, b) => a.id - b.id)
    },
    enabled: favorites.length > 0,
  })

  // Filtro en memoria: nombre + filtros (usando el dataset local para type/region/gen)
  const q = search.trim().toLowerCase()
  const filtered = (data ?? []).filter((p) => {
    if (q && !getRegionalDisplayName(p.name).toLowerCase().includes(q) && !p.name.includes(q)) return false

    const entry = POKEMON_DATA.find((e) => e.id === p.id)
    if (filters.types.length && !(entry && filters.types.some((t) => entry.types.includes(t)))) return false
    if (filters.regions.length && !(entry && filters.regions.some((r) => entry.regions.includes(r)))) return false
    if (filters.gens.length && !(entry && filters.gens.some((g) => GEN_TO_REGION[g] === entry.region))) return false

    return true
  })

  function handleClearAll() {
    if (confirm('Remove all favorites?')) clearFavorites()
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">♥ Favorites</h2>
        <button onClick={handleClearAll} className="text-sm text-gray-400 hover:text-red-500 transition font-semibold">
          Remove all favorites
        </button>
      </div>

      {favorites.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your favorites..."
            className="w-full px-4 py-2 border border-gray-300 rounded-full text-gray-700 text-sm focus:outline-none focus:border-red-400 mb-4"
          />

          <FilterBar filters={filters} toggle={toggle} clearGroup={clearGroup} clearAll={clearAll} />

          {isLoading ? (
            <LoadingSpinner text="Loading favorites..." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {filtered.length === 0 ? (
                <p className="text-gray-400 col-span-full text-center py-8">No Pokémon found.</p>
              ) : (
                filtered.map((p) => <DexCard key={p.id} pokemon={p} />)
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}