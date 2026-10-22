import { useInfiniteQuery } from "@tanstack/react-query";
import { getAbility, fetchInBatches } from "../lib/api";
import type { Ability } from "../types/ability";

const PAGE_SIZE = 30;

export function useAbilityList(names: string[], cacheKey: string) {
  return useInfiniteQuery({
    queryKey: ["ability-list", cacheKey],
    queryFn: async ({ pageParam }) => {
      const slice = names.slice(pageParam, pageParam + PAGE_SIZE);
      const results = await fetchInBatches(slice, getAbility, 20);
      // Las que no son de la serie principal vienen de spin-offs
      return results.filter(
        (a): a is Ability => a !== null && a.is_main_series,
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