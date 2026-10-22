import { useQuery } from "@tanstack/react-query";
import { getItemNames } from "../lib/api";

export function useItemNames() {
  return useQuery({
    queryKey: ["item-names"],
    queryFn: getItemNames,
    staleTime: Infinity,
  });
}