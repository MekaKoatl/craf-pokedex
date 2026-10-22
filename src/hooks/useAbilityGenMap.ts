import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../lib/constants";

export function useAbilityGenMap(enabled: boolean) {
  return useQuery({
    queryKey: ["ability-gen-map"],
    enabled,
    staleTime: Infinity,
    queryFn: async () => {
      const map: Record<string, number> = {};
      await Promise.all(
        [3, 4, 5, 6, 7, 8, 9].map(async (g) => {
          const res = await fetch(`${BASE_URL}/generation/${g}`);
          if (!res.ok) return;
          const data = (await res.json()) as { abilities: { name: string }[] };
          for (const a of data.abilities) map[a.name] = g;
        }),
      );
      return map;
    },
  });
}