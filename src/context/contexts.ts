import { createContext } from "react";
import type { PokemonList } from "./ListsContext";
import type { Team, TeamMember } from "./TeamsContext";

// Objetos de contexto de la app. Están separados de sus providers para que
// los archivos de componentes solo exporten componentes (requisito de fast refresh).

/** Valor que expone el contexto de favoritos. */
export interface FavoritesContextValue {
  /** Ids de Pokémon favoritos, en el orden en que se agregaron. */
  favorites: number[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
  clearFavorites: () => void;
  /** Reemplaza todos los favoritos (al importar un backup). */
  replaceFavorites: (ids: number[]) => void;
}

/** Contexto de favoritos. Es null fuera de `FavoritesProvider`; usar `useFavorites`. */
export const FavoritesContext = createContext<FavoritesContextValue | null>(
  null,
);

/** Valor que expone el contexto de listas. */
export interface ListsContextValue {
  lists: PokemonList[];
  /**
   * Valida un nombre de lista. Devuelve null si es válido o el mensaje de error.
   * `ignoreId` excluye una lista de la comparación (al renombrarla).
   */
  listNameError: (name: string, ignoreId?: string) => string | null;
  /** Crea una lista vacía. Devuelve su id, o null si el nombre no es válido. */
  createList: (name: string) => string | null;
  /** Renombra una lista. Devuelve false si el nombre no es válido. */
  renameList: (listId: string, name: string) => boolean;
  deleteList: (listId: string) => void;
  isInList: (listId: string, pokemonId: number) => boolean;
  /** Agrega el Pokémon a la lista o lo quita si ya estaba. */
  toggleInList: (listId: string, pokemonId: number) => void;
  /** Reemplaza todas las listas (al importar un backup). */
  replaceLists: (lists: PokemonList[]) => void;
}

/** Contexto de listas. Es null fuera de `ListsProvider`; usar `useLists`. */
export const ListsContext = createContext<ListsContextValue | null>(null);

/** Valor que expone el contexto de equipos. */
export interface TeamsContextValue {
  teams: Team[];
  /**
   * Valida un nombre de equipo. Devuelve null si es válido o el mensaje de error.
   * `ignoreId` excluye un equipo de la comparación (al renombrarlo).
   */
  teamNameError: (name: string, ignoreId?: string) => string | null;
  /**
   * Crea un equipo, vacío o con `members` (al duplicar). Devuelve su id,
   * o null si el nombre no es válido.
   */
  createTeam: (
    name: string,
    game: string,
    members?: TeamMember[],
  ) => string | null;
  /** Renombra un equipo. Devuelve false si el nombre no es válido. */
  renameTeam: (teamId: string, name: string) => boolean;
  deleteTeam: (teamId: string) => void;
  /** Agrega un miembro con configuración vacía; no hace nada si el equipo está lleno. */
  addMember: (teamId: string, pokemonId: number) => void;
  /** Quita el miembro de la posición `index` (por posición: un Pokémon puede repetirse). */
  removeMember: (teamId: string, index: number) => void;
  /** Mueve un miembro de `from` a `to`; si `to` supera el final, va al final. */
  moveMember: (teamId: string, from: number, to: number) => void;
  /** Actualiza solo los campos indicados de un miembro, p. ej. `{ ability: "blaze" }`. */
  updateMember: (
    teamId: string,
    index: number,
    changes: Partial<TeamMember>,
  ) => void;
  /** Reemplaza todos los equipos (al importar un backup). */
  replaceTeams: (teams: Team[]) => void;
}

/** Contexto de equipos. Es null fuera de `TeamsProvider`; usar `useTeams`. */
export const TeamsContext = createContext<TeamsContextValue | null>(null);
