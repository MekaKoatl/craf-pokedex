import { createContext, useState, useEffect, type ReactNode } from "react";

const STORAGE_KEY = "craf-teams";

export const MAX_TEAMS = 30;
export const TEAM_SIZE = 6;

export interface TeamMember {
  pokemonId: number;
  ability: string | null;
  item: string | null;
  nature: string | null;
  moves: string[]; // hasta 4
  // Opcionales: los equipos guardados antes no los tienen
  level?: number; // sin valor = 50
  evs?: [number, number, number, number, number, number]; // HP, Atk, Def, SpA, SpD, Spe
  ivs?: [number, number, number, number, number, number];
}

export interface Team {
  id: string;
  name: string;
  game: string; // id del juego: "scarlet", "omega-ruby"...
  members: TeamMember[]; // hasta TEAM_SIZE
}

// Lo que el context expone a la app
interface TeamsContextValue {
  teams: Team[];
  // null = el nombre sirve. Si no, el motivo para mostrarle al usuario.
  // ignoreId: al renombrar, el propio equipo no cuenta como repetido
  teamNameError: (name: string, ignoreId?: string) => string | null;
  // members: para duplicar un equipo; si no se pasa, arranca vacío
  createTeam: (
    name: string,
    game: string,
    members?: TeamMember[],
  ) => string | null; // id nuevo, o null // id nuevo, o null
  renameTeam: (teamId: string, name: string) => boolean;
  deleteTeam: (teamId: string) => void;
  addMember: (teamId: string, pokemonId: number) => void;
  removeMember: (teamId: string, index: number) => void;
  // Mueve un miembro de una posición a otra (to más allá del final = al final)
  moveMember: (teamId: string, from: number, to: number) => void;
  // Cambia solo los campos que le pases: { ability: "blaze" }
  updateMember: (
    teamId: string,
    index: number,
    changes: Partial<TeamMember>,
  ) => void;
}

export const TeamsContext = createContext<TeamsContextValue | null>(null);

// Lee localStorage una vez al arrancar
function readInitial(): Team[] {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(readInitial);

  // Cada vez que cambian, se guardan en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  }, [teams]);

  function teamNameError(name: string, ignoreId?: string) {
    const clean = name.trim();
    // El límite solo importa al crear, no al renombrar
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

  // Cambia un solo equipo y deja los demás como estaban
  function updateTeam(teamId: string, change: (t: Team) => Team) {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? change(t) : t)));
  }

  function addMember(teamId: string, pokemonId: number) {
    updateTeam(teamId, (t) =>
      // Si ya está lleno, no se toca
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

  // Por posición y no por id: el mismo Pokémon puede estar dos veces
  function removeMember(teamId: string, index: number) {
    updateTeam(teamId, (t) => ({
      ...t,
      members: t.members.filter((_, i) => i !== index),
    }));
  }

  function moveMember(teamId: string, from: number, to: number) {
    updateTeam(teamId, (t) => {
      const members = [...t.members];
      // splice saca 1 elemento en "from" y lo devuelve en un array
      const [moved] = members.splice(from, 1);
      // y acá lo inserta en "to" sin borrar nada (el 0)
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
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
}
