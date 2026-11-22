import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchInBatches } from "../lib/api";

const PAGE_SIZE = 30;

// Recibe la lista completa de nombres ya filtrada y la va sirviendo de a 30.
// - kind: nombre para la caché ("item", "move"...)
// - cacheKey: identifica esa lista sin tener que hashear el array entero
// - fetchOne: pide un elemento; devuelve null si no existe
// - keep: decide cuáles se muestran (por defecto, todos)
export function usePagedList<T>(
  kind: string,
  names: string[],
  cacheKey: string,
  fetchOne: (name: string) => Promise<T | null>,
  keep: (x: T) => boolean = () => true,
) {
  return useInfiniteQuery({
    queryKey: [`${kind}-list`, cacheKey],
    queryFn: async ({ pageParam }) => {
      const slice = names.slice(pageParam, pageParam + PAGE_SIZE);
      const results = await fetchInBatches(slice, fetchOne, 20);
      return results.filter((x): x is T => x !== null && keep(x));
    },
    initialPageParam: 0,
    getNextPageParam: (_last, all) => {
      const next = all.length * PAGE_SIZE;
      return next < names.length ? next : undefined;
    },
    enabled: names.length > 0,
  });
}