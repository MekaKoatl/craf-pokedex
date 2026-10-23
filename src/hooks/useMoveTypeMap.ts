import { useQuery } from "@tanstack/react-query";
import { getMovesOfType } from "../lib/api";
import { MOVE_TYPES } from "../lib/moves";

export function useMoveTypeMap(enabled: boolean) {
  return useQuery({
    queryKey: ["move-type-map"],
    enabled,
    staleTime: Infinity,
    queryFn: async () => {
      const map: Record<string, string> = {};
      await Promise.all(
        MOVE_TYPES.map(async (t) => {
          const names = await getMovesOfType(t);
          for (const n of names) map[n] = t;
        }),
      );
      return map;
    },
  });
}
