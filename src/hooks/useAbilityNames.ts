import { useQuery } from "@tanstack/react-query";
import { getAbilityNames } from "../lib/api";

/** Nombres de todos las habilidades. Se piden una vez por sesión y sirven de índice para buscar, filtrar y paginar. */
export function useAbilityNames() {
  return useQuery({
    queryKey: ["ability-names"],
    queryFn: getAbilityNames,
    staleTime: Infinity,
  });
}
