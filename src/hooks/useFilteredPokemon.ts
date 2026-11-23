import { useQuery } from "@tanstack/react-query";
import { filterPokemonData } from "../lib/filterPokemon";
import { fetchPokemonById, fetchInBatches } from "../lib/api";
import type { FilterState } from "./useFilters";
import type { Pokemon } from "../types/pokemon";

/**
 * Pokémon que cumplen los filtros, ordenados por id. Filtra sobre el dataset
 * local y pide a la API solo los resultados.
 *
 * @param enabled Solo consulta si hay algún filtro activo.
 */
export function useFilteredPokemon(filters: FilterState, enabled: boolean) {
  return useQuery({
    queryKey: ["filtered-pokemon", filters],
    queryFn: async () => {
      const entries = filterPokemonData(filters);
      const results = await fetchInBatches(
        entries,
        (entry) => fetchPokemonById(entry.id),
        20,
      );
      return results
        .filter((p): p is Pokemon => p !== null)
        .sort((a, b) => a.id - b.id);
    },
    enabled,
  });
}
