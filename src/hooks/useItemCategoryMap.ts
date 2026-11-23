import { useQuery } from "@tanstack/react-query";
import { getItemsInGroup } from "../lib/api";
import { ITEM_GROUPS } from "../lib/itemGroups";

/**
 * Mapa objeto → grupo de categorías (el texto del filtro), para ordenar por categoría.
 * Hace una petición por categoría, así que solo se pide cuando `enabled` es true.
 */
export function useItemCategoryMap(enabled: boolean) {
  return useQuery({
    queryKey: ["item-category-map"],
    enabled,
    staleTime: Infinity,
    queryFn: async () => {
      const map: Record<string, string> = {};
      await Promise.all(
        ITEM_GROUPS.filter((g) => g.key !== "all").map(async (g) => {
          const names = await getItemsInGroup(g.categories);
          for (const n of names) map[n] = g.label;
        }),
      );
      return map;
    },
  });
}
