import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../lib/constants";
import { POKEMON_DATA } from "../data/pokemon-data";

/**
 * Nombres de búsqueda de Pokémon: las 1025 especies de la API más las
 * formas regionales del dataset local.
 */
export function usePokemonNames() {
  return useQuery({
    queryKey: ["pokemon-names"],
    queryFn: async (): Promise<string[]> => {
      const res = await fetch(`${BASE_URL}/pokemon?limit=1025`);
      const data = await res.json();
      const baseNames = data.results.map((p: { name: string }) => p.name);
      const regionalNames = POKEMON_DATA.filter((e) => e.isRegional).map(
        (e) => e.name,
      );
      return [...baseNames, ...regionalNames];
    },
    staleTime: Infinity,
  });
}
