import { useQuery } from "@tanstack/react-query";
import { getItemNames } from "../lib/api";

/** Nombres de todos los objetos. Se piden una vez por sesión y sirven de índice para buscar, filtrar y paginar. */
export function useItemNames() {
  return useQuery({
    queryKey: ["item-names"],
    queryFn: getItemNames,
    staleTime: Infinity,
  });
}
