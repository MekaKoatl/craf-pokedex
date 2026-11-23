import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchInBatches } from "../lib/api";

/** Elementos por página. */
const PAGE_SIZE = 30;

/**
 * Pagina una lista de nombres ya filtrada y ordenada: pide los datos de cada
 * página (de a `PAGE_SIZE`) a medida que se cargan más con `fetchNextPage`.
 *
 * @param kind Prefijo de la clave de caché, p. ej. "item" o "move".
 * @param names Nombres a mostrar, en orden.
 * @param cacheKey Identifica la combinación de filtros y orden que produjo `names`.
 * @param fetchOne Pide un elemento por nombre; devuelve null si no existe.
 * @param keep Decide qué elementos se muestran (por defecto, todos).
 */
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
