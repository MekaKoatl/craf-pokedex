import { useQueries } from "@tanstack/react-query";
import { getPokemonFull } from "../lib/api";
import { megaNameFor } from "../lib/teamRules";
import type { TeamMember } from "../context/TeamsContext";
import type { PokemonFull } from "../types/pokemon";

export interface MemberForm {
  base: PokemonFull | undefined; // undefined mientras carga
  mega: PokemonFull | null; // null si no se megaevoluciona
}

export function useTeamForms(members: TeamMember[]): MemberForm[] {
  // 1) El Pokémon de cada miembro
  const bases = useQueries({
    queries: members.map((m) => ({
      queryKey: ["pokemon-full", m.pokemonId],
      queryFn: () => getPokemonFull(m.pokemonId),
      staleTime: Infinity,
    })),
  });

  // 2) Con la especie ya cargada se sabe si la piedra le corresponde
  const megaNames = members.map((m, i) => {
    const p = bases[i]?.data;
    return p ? megaNameFor(p.species.name, m.item) : null;
  });

  const megas = useQueries({
    queries: megaNames.map((n) => ({
      queryKey: ["pokemon-full", n ?? ""],
      queryFn: () => getPokemonFull(n as string),
      enabled: !!n,
      // Si esa Mega no existe en la API, no tiene sentido reintentar
      retry: false,
      staleTime: Infinity,
    })),
  });

  return members.map((_, i) => ({
    base: bases[i]?.data,
    mega: megaNames[i] ? (megas[i]?.data ?? null) : null,
  }));
}