import { useState, useEffect, type ReactNode } from "react";
import { TeamsContext } from "./contexts";

/** Clave de `localStorage` donde se guardan los equipos. */
const STORAGE_KEY = "craf-teams";

/** Cantidad máxima de equipos. */
export const MAX_TEAMS = 30;
/** Cantidad máxima de miembros por equipo. */
export const TEAM_SIZE = 6;

/** Un Pokémon dentro de un equipo, con su configuración. */
export interface TeamMember {
  pokemonId: number;
  ability: string | null;
  item: string | null;
  nature: string | null;
  /** Hasta 4 movimientos; un string vacío es un casillero libre. */
  moves: string[];
  // Opcionales para mantener compatibilidad con equipos guardados antes de existir
  /** Nivel; sin valor se usa `DEFAULT_LEVEL` (50). */
  level?: number;
  /** EVs en el orden HP, Atk, Def, SpA, SpD, Spe. */
  evs?: [number, number, number, number, number, number];
  /** IVs en el mismo orden que los EVs. */
  ivs?: [number, number, number, number, number, number];
}

/** Equipo creado por el usuario para un juego. */
export interface Team {
  id: string;
  name: string;
  /** Id del juego, p. ej. "scarlet" u "omega-ruby". */
  game: string;
  /** Hasta `TEAM_SIZE` miembros. */
  members: TeamMember[];
}

/** Equipos guardados, o [] si no hay o el JSON es inválido. */
function readInitial(): Team[] {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Provee los equipos a la app y los persiste en `localStorage` en cada cambio. */
export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(readInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  }, [teams]);

  function teamNameError(name: string, ignoreId?: string) {
    const clean = name.trim();
    // El límite aplica solo al crear
    if (!ignoreId && teams.length >= MAX_TEAMS)
      return `You can have up to ${MAX_TEAMS} teams.`;
    if (!clean) return "Write a name for the team.";
    const taken = teams.some(
      (t) => t.id !== ignoreId && t.name.toLowerCase() === clean.toLowerCase(),
    );
    if (taken) return "There is already a team with that name.";
    return null;
  }

  function createTeam(name: string, game: string, members: TeamMember[] = []) {
    if (teamNameError(name)) return null;
    const id = crypto.randomUUID();
    setTeams((prev) => [
      ...prev,
      { id, name: name.trim(), game, members: members.slice(0, TEAM_SIZE) },
    ]);
    return id;
  }

  function renameTeam(teamId: string, name: string) {
    if (teamNameError(name, teamId)) return false;
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, name: name.trim() } : t)),
    );
    return true;
  }

  function deleteTeam(teamId: string) {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
  }

  /** Aplica `change` a un equipo y deja los demás igual. */
  function updateTeam(teamId: string, change: (t: Team) => Team) {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? change(t) : t)));
  }

  function addMember(teamId: string, pokemonId: number) {
    updateTeam(teamId, (t) =>
      t.members.length >= TEAM_SIZE
        ? t
        : {
            ...t,
            members: [
              ...t.members,
              { pokemonId, ability: null, item: null, nature: null, moves: [] },
            ],
          },
    );
  }

  function removeMember(teamId: string, index: number) {
    updateTeam(teamId, (t) => ({
      ...t,
      members: t.members.filter((_, i) => i !== index),
    }));
  }

  function moveMember(teamId: string, from: number, to: number) {
    updateTeam(teamId, (t) => {
      const members = [...t.members];
      const [moved] = members.splice(from, 1);
      members.splice(Math.min(to, members.length), 0, moved);
      return { ...t, members };
    });
  }

  function updateMember(
    teamId: string,
    index: number,
    changes: Partial<TeamMember>,
  ) {
    updateTeam(teamId, (t) => ({
      ...t,
      members: t.members.map((m, i) =>
        i === index ? { ...m, ...changes } : m,
      ),
    }));
  }

  return (
    <TeamsContext.Provider
      value={{
        teams,
        teamNameError,
        createTeam,
        renameTeam,
        deleteTeam,
        addMember,
        removeMember,
        moveMember,
        updateMember,
        replaceTeams: setTeams,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
}
