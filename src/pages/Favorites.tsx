import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useFavorites } from "../hooks/useFavorites";
import { useFilters } from "../hooks/useFilters";
import { FilterBar } from "../components/filters/FilterBar";
import { AddPokemonSearch } from "../components/AddPokemonSearch";
import { ClearButton } from "../components/ClearButton";
import { fetchPokemonById } from "../lib/api";
import { getRegionalDisplayName } from "../lib/regional";
import { compareDex } from "../lib/dexOrder";
import { matchesFilters } from "../lib/matchFilters";
import { DexCard } from "../components/DexCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import type { Pokemon } from "../types/pokemon";

export function Favorites() {
  const { favorites, isFavorite, toggleFavorite, clearFavorites } =
    useFavorites();
  const { filters, toggle, clearGroup, clearAll } = useFilters();
  const [search, setSearch] = useState("");

  // Uno por Pokémon: al agregar uno nuevo, solo se pide ese
  const ids = [...favorites].sort(compareDex);
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["list-pokemon", id],
      queryFn: () => fetchPokemonById(id),
      staleTime: Infinity,
    })),
  });
  const pokes = results.map((r) => r.data).filter((p): p is Pokemon => !!p);
  const loading = results.some((r) => r.isLoading);

  // Buscar dentro de los favoritos + filtros
  const q = search.trim().toLowerCase();
  const filtered = pokes.filter(
    (p) =>
      (!q ||
        p.name.includes(q) ||
        getRegionalDisplayName(p.name).toLowerCase().includes(q)) &&
      matchesFilters(p.id, filters),
  );

  function handleClearAll() {
    if (confirm("Remove all favorites?")) clearFavorites();
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Favorites{" "}
          <span className="text-base font-semibold text-gray-400">
            ({favorites.length})
          </span>
        </h2>
        {favorites.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-400 hover:text-red-500 transition font-semibold cursor-pointer"
          >
            Remove all favorites
          </button>
        )}
      </div>

      {/* Agregar: en su propia tarjeta */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
          Add Pokémon
        </p>
        <AddPokemonSearch
          isAdded={isFavorite}
          onToggle={toggleFavorite}
          placeholder="Search a Pokémon to add to your favorites..."
        />
      </div>

      {favorites.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Buscar dentro: lupa y fondo gris, distinto del de agregar */}
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Search in your favorites
          </p>
          <div className="relative mb-4">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter your favorites by name..."
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-full bg-gray-50 text-gray-700 text-sm focus:outline-none focus:border-red-400 focus:bg-white"
            />
            <ClearButton show={search !== ""} onClear={() => setSearch("")} />
          </div>

          <FilterBar
            filters={filters}
            toggle={toggle}
            clearGroup={clearGroup}
            clearAll={clearAll}
          />

          {loading && pokes.length === 0 ? (
            <LoadingSpinner text="Loading favorites..." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {filtered.length === 0 ? (
                <p className="text-gray-400 col-span-full text-center py-8">
                  No Pokémon found.
                </p>
              ) : (
                filtered.map((p) => <DexCard key={p.id} pokemon={p} />)
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
