import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPokemonById } from "../lib/api";
import { POKEMON_DATA } from "../data/pokemon-data";
import { REGIONAL_SUFFIX_LIST } from "../lib/constants";
import type { Pokemon } from "../types/pokemon";

/** Especies por lote. */
const BATCH_SIZE = 150;

/** Carga un lote de especies desde `startId` e inserta cada forma regional después de su especie. */
async function fetchBatch(startId: number): Promise<Pokemon[]> {
  const ids = Array.from({ length: BATCH_SIZE }, (_, i) => startId + i);
  const pokemons = await Promise.all(ids.map(fetchPokemonById));
  const valid = pokemons.filter((p): p is Pokemon => p !== null);

  const regionalData = POKEMON_DATA.filter((e) => e.isRegional);
  const expanded: Pokemon[] = [];

  for (const p of valid) {
    expanded.push(p);
    const regionals = regionalData.filter((e) => {
      const suffix = REGIONAL_SUFFIX_LIST.find((s) => e.name.endsWith(s));
      const baseName = suffix ? e.name.replace(suffix, "") : null;
      return baseName === p.name;
    });
    for (const r of regionals) {
      const rp = await fetchPokemonById(r.id);
      if (rp) expanded.push(rp);
    }
  }
  return expanded;
}

/**
 * Galería de toda la Pokédex en lotes de `BATCH_SIZE` especies, con las
 * formas regionales intercaladas. Se avanza con `fetchNextPage`.
 */
export function useDexGallery() {
  return useInfiniteQuery({
    queryKey: ["dex-gallery"],
    queryFn: ({ pageParam }) => fetchBatch(pageParam),
    initialPageParam: 1,
    getNextPageParam: (_lastPage, allPages) => {
      const nextStart = allPages.length * BATCH_SIZE + 1;
      return nextStart <= 1025 ? nextStart : undefined; // undefined: no hay más lotes
    },
  });
}
