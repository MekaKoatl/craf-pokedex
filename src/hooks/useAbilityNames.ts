import { useQuery } from "@tanstack/react-query";
import { getAbilityNames } from "../lib/api";

export function useAbilityNames() {
  return useQuery({
    queryKey: ["ability-names"],
    queryFn: getAbilityNames,
    staleTime: Infinity,
  });
}