import { useState } from "react";
import { useFilters } from "../hooks/useFilters";
import { useFilteredPokemon } from "../hooks/useFilteredPokemon";
import { useDexGallery } from "../hooks/useDexGallery";
import { usePokemonNames } from "../hooks/usePokemonNames";
import { useSearchPokemon } from "../hooks/useSearchPokemon";
import { FilterBar } from "../components/filters/FilterBar";
import { SearchBar } from "../components/SearchBar";
import { DexCard } from "../components/DexCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { LoadMoreButton } from "../components/LoadMoreButton";

/**
 * Página Pokédex Search (`/dxg`): toda la Pokédex en lotes, con búsqueda
 * por nombre o número y filtros. Con búsqueda o filtros activos muestra
 * esos resultados en lugar de la galería.
 */
export function DexGallery() {
  const { filters, toggle, clearGroup, clearAll, hasAnyActive } = useFilters();
  const [search, setSearch] = useState("");

  const { data: allNames = [] } = usePokemonNames();
  const searchResults = useSearchPokemon(search, allNames);
  const gallery = useDexGallery();
  const filtered = useFilteredPokemon(filters, hasAnyActive);

  const isSearching = search.length > 0;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pokedex</h2>
      </div>

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
              <p className="text-gray-400 col-span-full text-center py-8">
                No Pokémon found.
              </p>
            ) : (
              searchResults.data!.map((p) => <DexCard key={p.id} pokemon={p} />)
            )}
          </div>
        )
      ) : hasAnyActive ? (
        filtered.isLoading ? (
          <LoadingSpinner text="Searching..." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {(filtered.data ?? []).length === 0 ? (
              <p className="text-gray-400 col-span-full text-center py-8">
                No Pokémon found.
              </p>
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
          <LoadMoreButton
            show={gallery.hasNextPage}
            loading={gallery.isFetchingNextPage}
            onClick={() => gallery.fetchNextPage()}
          />
        </>
      )}
    </section>
  );
}
