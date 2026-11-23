import { useQueries } from "@tanstack/react-query";
import { getPokemonFull } from "../lib/api";
import { megaNameFor } from "../lib/teamRules";
import type { TeamMember } from "../context/TeamsContext";
import type { PokemonFull } from "../types/pokemon";

/** Datos de un miembro del equipo para mostrar y analizar. */
export interface MemberForm {
  /** Datos del Pokémon; undefined mientras carga. */
  base: PokemonFull | undefined;
  /** Datos de su forma Mega si lleva la Megapiedra correspondiente; si no, null. */
  mega: PokemonFull | null;
}

/**
 * Datos de cada miembro del equipo y, si lleva su Megapiedra, de su forma Mega.
 * Devuelve un elemento por miembro, en el mismo orden.
 */
export function useTeamForms(members: TeamMember[]): MemberForm[] {
  // 1) Datos de cada miembro
  const bases = useQueries({
    queries: members.map((m) => ({
      queryKey: ["pokemon-full", m.pokemonId],
      queryFn: () => getPokemonFull(m.pokemonId),
      staleTime: Infinity,
    })),
  });

  // 2) Con el Pokémon cargado se verifica si el objeto es su Megapiedra
  const megaNames = members.map((m, i) => {
    const p = bases[i]?.data;
    return p ? megaNameFor(p.species.name, m.item) : null;
  });

  const megas = useQueries({
    queries: megaNames.map((n) => ({
      queryKey: ["pokemon-full", n ?? ""],
      queryFn: () => getPokemonFull(n as string),
      enabled: !!n,
      // Si la forma Mega no existe en la API, no se reintenta
      retry: false,
      staleTime: Infinity,
    })),
  });

  return members.map((_, i) => ({
    base: bases[i]?.data,
    mega: megaNames[i] ? (megas[i]?.data ?? null) : null,
  }));
}
