import { useQuery } from "@tanstack/react-query";
import { fetchPokemonById } from "../lib/api";
import { getRandomPokemonId } from "../lib/regional";
import { boxIconUrl, imageExists } from "../lib/sprites";
import { TOTAL_POKEMON } from "../lib/constants";
import type { Pokemon } from "../types/pokemon";

const TICKER_SIZE = 50; // cuántos entran a la cinta
const PROBE_SIZE = 90; // cuántos ids se prueban por ronda
const MAX_ROUNDS = 4; // tope, por si fallan demasiados

// Busca ids que de verdad tengan icono de PC
async function pickIdsWithIcon(howMany: number): Promise<number[]> {
  const found: number[] = [];
  const tried = new Set<number>();

  for (let round = 0; round < MAX_ROUNDS; round++) {
    if (found.length >= howMany) break;
    if (tried.size >= TOTAL_POKEMON) break;

    // Candidatos nuevos, sin repetir los ya probados
    const candidates: number[] = [];
    while (candidates.length < PROBE_SIZE && tried.size < TOTAL_POKEMON) {
      const id = getRandomPokemonId();
      if (tried.has(id)) continue;
      tried.add(id);
      candidates.push(id);
    }

    // Se prueban todos a la vez
    const results = await Promise.all(
      candidates.map(async (id) =>
        (await imageExists(boxIconUrl(id))) ? id : null,
      ),
    );

    for (const id of results) {
      if (id !== null && found.length < howMany) found.push(id);
    }
  }

  return found;
}

export function useTickerPokemon() {
  return useQuery({
    queryKey: ["ticker-pool"],
    queryFn: async () => {
      // Primero los iconos (baratos), después el JSON solo de los que sirven
      const ids = await pickIdsWithIcon(TICKER_SIZE);
      const results = await Promise.all(ids.map(fetchPokemonById));
      return results.filter((p): p is Pokemon => p !== null);
    },
    staleTime: Infinity,
  });
}