import { useQuery } from "@tanstack/react-query";
import { matchNames } from "../lib/searchNames";
import { fetchPokemonById } from "../lib/api";
import type { Pokemon } from "../types/pokemon";

/**
 * Busca Pokémon por número de Pokédex o por nombre (incluye nombres regionales
 * legibles). Devuelve los resultados ordenados por id.
 *
 * @param query Texto buscado; no busca si está vacío.
 * @param allNames Nombres en los que buscar (ver `usePokemonNames`).
 */
export function useSearchPokemon(query: string, allNames: string[]) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      // Un número se busca directamente por id
      if (/^\d+$/.test(query)) {
        const p = await fetchPokemonById(query);
        return p ? [p] : [];
      }
      const matches = matchNames(allNames, query);
      const results = await Promise.all(
        matches.map((n) => fetchPokemonById(n)),
      );
      return results
        .filter((p): p is Pokemon => p !== null)
        .sort((a, b) => a.id - b.id);
    },
    enabled: query.length > 0,
  });
}
