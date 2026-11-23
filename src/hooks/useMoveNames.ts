import { useQuery } from "@tanstack/react-query";
import { getMoveNames } from "../lib/api";

/** Nombres de todos los movimientos. Se piden una vez por sesión y sirven de índice para buscar, filtrar y paginar. */
export function useMoveNames() {
  return useQuery({
    queryKey: ["move-names"],
    queryFn: getMoveNames,
    staleTime: Infinity,
  });
}
