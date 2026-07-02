import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFavorites } from "../hooks/useFavorites";
import { fetchPokemonById } from "../lib/api";
import { getRegionalDisplayName } from "../lib/regional";
import { DexCard } from "../components/DexCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import type { Pokemon } from "../types/pokemon";

export function Favorites() {
  const { favorites, clearFavorites } = useFavorites();
  const [search, setSearch] = useState("");

  // Carga todos los favoritos (en lote) y los ordena por id
  const { data, isLoading } = useQuery({
    queryKey: ["favorites", favorites],
    queryFn: async () => {
      const results = await Promise.all(
        favorites.map((id) => fetchPokemonById(id)),
      );
      return results
        .filter((p): p is Pokemon => p !== null)
        .sort((a, b) => a.id - b.id);
    },
    enabled: favorites.length > 0,
  });

  // Filtro por nombre (en memoria, sobre lo ya cargado)
  const q = search.trim().toLowerCase();
  const filtered = (data ?? []).filter((p) => {
    if (!q) return true;
    return (
      getRegionalDisplayName(p.name).toLowerCase().includes(q) ||
      p.name.includes(q)
    );
  });

  function handleClearAll() {
    if (confirm("Remove all favorites?")) clearFavorites();
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Favorites</h2>
        <button
          onClick={handleClearAll}
          className="text-sm text-gray-400 hover:text-red-500 transition font-semibold"
        >
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
            className="w-full px-4 py-2 border border-gray-300 rounded-full text-gray-700 text-sm focus:outline-none focus:border-red-400 mb-6"
          />

          {isLoading ? (
            <LoadingSpinner text="Loading favorites..." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {filtered.map((p) => (
                <DexCard key={p.id} pokemon={p} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
