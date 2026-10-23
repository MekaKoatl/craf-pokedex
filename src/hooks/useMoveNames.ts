import { useQuery } from "@tanstack/react-query";
import { getMoveNames } from "../lib/api";

export function useMoveNames() {
  return useQuery({
    queryKey: ["move-names"],
    queryFn: getMoveNames,
    staleTime: Infinity,
  });
}
