import { useInfiniteQuery } from "@tanstack/react-query";
import { getMove, fetchInBatches } from "../lib/api";
import type { Move } from "../types/move";

const PAGE_SIZE = 30;

// Recibe la lista completa de nombres ya filtrada y la va sirviendo de a 30.
// cacheKey identifica esa lista sin tener que hashear el array entero.
export function useMoveList(names: string[], cacheKey: string) {
  return useInfiniteQuery({
    queryKey: ["move-list", cacheKey],
    queryFn: async ({ pageParam }) => {
      const slice = names.slice(pageParam, pageParam + PAGE_SIZE);
      const results = await fetchInBatches(slice, getMove, 20);
      return results.filter((m): m is Move => m !== null);
    },
    initialPageParam: 0,
    getNextPageParam: (_last, all) => {
      const next = all.length * PAGE_SIZE;
      return next < names.length ? next : undefined;
    },
    enabled: names.length > 0,
  });
}
