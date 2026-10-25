import { useQuery } from "@tanstack/react-query";
import { getMovesInDamageClass } from "../lib/api";
import { MOVE_CATEGORIES } from "../lib/moves";

export function useMoveCategoryMap(enabled: boolean) {
  return useQuery({
    queryKey: ["move-category-map"],
    enabled,
    staleTime: Infinity,
    queryFn: async () => {
      const map: Record<string, string> = {};
      await Promise.all(
        MOVE_CATEGORIES.map(async (c) => {
          const names = await getMovesInDamageClass(c);
          for (const n of names) map[n] = c;
        }),
      );
      return map;
    },
  });
}