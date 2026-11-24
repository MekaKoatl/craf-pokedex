import { useQuery } from "@tanstack/react-query";
import { fetchPokemonById } from "../lib/api";
import { idsWithBoxIcon } from "../lib/sprites";
import type { Pokemon } from "../types/pokemon";

/** Cantidad de Pokémon en la tira de íconos de Home. */
const TICKER_SIZE = 50;

/**
 * Selección al azar de Pokémon con ícono de PC para la tira de Home.
 * Se elige una vez por sesión.
 */
export function useTickerPokemon() {
  return useQuery({
    queryKey: ["ticker-pool"],
    queryFn: async () => {
      const withIcon = idsWithBoxIcon();
      const ids = new Set<number>();
      while (ids.size < TICKER_SIZE) {
        ids.add(withIcon[Math.floor(Math.random() * withIcon.length)]);
      }

      const results = await Promise.all([...ids].map(fetchPokemonById));
      return results.filter((p): p is Pokemon => p !== null);
    },
    staleTime: Infinity,
  });
}
