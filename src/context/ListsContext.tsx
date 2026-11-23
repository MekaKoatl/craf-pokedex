import { useState, useEffect, type ReactNode } from "react";
import { ListsContext } from "./contexts";

/** Clave de `localStorage` donde se guardan las listas. */
const STORAGE_KEY = "craf-lists";

/** Cantidad máxima de listas. */
export const MAX_LISTS = 20;

/** Lista de Pokémon creada por el usuario. */
export interface PokemonList {
  id: string;
  name: string;
  /** Ids de Pokémon, en el orden en que se agregaron. */
  pokemon: number[];
}

/** Listas guardadas, o [] si no hay o el JSON es inválido. */
function readInitial(): PokemonList[] {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Provee las listas a la app y las persiste en `localStorage` en cada cambio. */
export function ListsProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<PokemonList[]>(readInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }, [lists]);

  /** Aplica `change` a una lista y deja las demás igual. */
  function updateList(listId: string, change: (l: PokemonList) => PokemonList) {
    setLists((prev) => prev.map((l) => (l.id === listId ? change(l) : l)));
  }

  function listNameError(name: string, ignoreId?: string) {
    const clean = name.trim();
    // El límite aplica solo al crear
    if (!ignoreId && lists.length >= MAX_LISTS)
      return `You can have up to ${MAX_LISTS} lists.`;
    if (!clean) return "Write a name for the list.";
    // La comparación no distingue mayúsculas
    const taken = lists.some(
      (l) => l.id !== ignoreId && l.name.toLowerCase() === clean.toLowerCase(),
    );
    if (taken) return "There is already a list with that name.";
    return null;
  }

  function createList(name: string) {
    if (listNameError(name)) return null;
    const id = crypto.randomUUID();
    setLists((prev) => [...prev, { id, name: name.trim(), pokemon: [] }]);
    return id;
  }

  function renameList(listId: string, name: string) {
    if (listNameError(name, listId)) return false;
    updateList(listId, (l) => ({ ...l, name: name.trim() }));
    return true;
  }

  function deleteList(listId: string) {
    setLists((prev) => prev.filter((l) => l.id !== listId));
  }

  function isInList(listId: string, pokemonId: number) {
    return lists.some((l) => l.id === listId && l.pokemon.includes(pokemonId));
  }

  function toggleInList(listId: string, pokemonId: number) {
    updateList(listId, (l) => ({
      ...l,
      pokemon: l.pokemon.includes(pokemonId)
        ? l.pokemon.filter((x) => x !== pokemonId)
        : [...l.pokemon, pokemonId],
    }));
  }

  return (
    <ListsContext.Provider
      value={{
        lists,
        listNameError,
        createList,
        renameList,
        deleteList,
        isInList,
        toggleInList,
        replaceLists: setLists,
      }}
    >
      {children}
    </ListsContext.Provider>
  );
}
