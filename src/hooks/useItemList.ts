import { useInfiniteQuery } from "@tanstack/react-query";
import { getItem, fetchInBatches } from "../lib/api";
import type { Item } from "../types/item";

const PAGE_SIZE = 30;

// Recibe la lista completa de nombres ya filtrada y la va sirviendo de a 30.
// cacheKey identifica esa lista (categoría + búsqueda) sin tener que
// hashear el array entero en cada render.
export function useItemList(names: string[], cacheKey: string) {
  return useInfiniteQuery({
    queryKey: ["item-list", cacheKey],
    queryFn: async ({ pageParam }) => {
      const slice = names.slice(pageParam, pageParam + PAGE_SIZE);
      const results = await fetchInBatches(slice, getItem, 20);
      // Los que no tienen sprite son placeholders internos de los juegos
      return results.filter(
        (i): i is Item => i !== null && Boolean(i.sprites.default),
      );
    },
    initialPageParam: 0,
    getNextPageParam: (_last, all) => {
      const next = all.length * PAGE_SIZE;
      return next < names.length ? next : undefined;
    },
    enabled: names.length > 0,
  });
}