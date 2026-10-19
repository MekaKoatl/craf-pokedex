import { useQuery } from "@tanstack/react-query";
import { fetchPokemonById } from "../lib/api";
import { MAX_ICON_ID } from "../lib/constants";
import type { Pokemon } from "../types/pokemon";

const TICKER_SIZE = 50;

export function useTickerPokemon() {
  return useQuery({
    queryKey: ["ticker-pool"],
    queryFn: async () => {
      // Todos los ids hasta MAX_ICON_ID tienen icono, no hay nada que verificar
      const ids = new Set<number>();
      while (ids.size < TICKER_SIZE) {
        ids.add(Math.floor(Math.random() * MAX_ICON_ID) + 1);
      }

      const results = await Promise.all([...ids].map(fetchPokemonById));
      return results.filter((p): p is Pokemon => p !== null);
    },
    staleTime: Infinity,
  });
}