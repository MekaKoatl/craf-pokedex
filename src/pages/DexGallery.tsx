import { useDexGallery } from '../hooks/useDexGallery'
import { DexCard } from '../components/DexCard'
import { LoadingSpinner } from '../components/LoadingSpinner'

export function DexGallery() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useDexGallery()

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <LoadingSpinner text="Loading Pokédex..." />
      </section>
    )
  }

  // Junta todas las páginas en una sola lista plana
  const pokemons = data?.pages.flat() ?? []

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {pokemons.map((p, i) => (
          <DexCard key={`${p.id}-${i}`} pokemon={p} />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </section>
  )
}