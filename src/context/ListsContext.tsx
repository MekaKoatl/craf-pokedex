import { createContext, useState, useEffect, type ReactNode } from 'react'

const STORAGE_KEY = 'craf-lists'

// Máximo de listas que se pueden tener
export const MAX_LISTS = 20

export interface PokemonList {
  id: string
  name: string
  pokemon: number[] // ids de Pokémon
}

// Lo que el context expone a la app
interface ListsContextValue {
  lists: PokemonList[]
  // null = el nombre sirve. Si no, el motivo para mostrarle al usuario.
  // ignoreId: al renombrar, la propia lista no cuenta como repetida
  listNameError: (name: string, ignoreId?: string) => string | null
  createList: (name: string) => string | null // id nuevo, o null si no se pudo
  renameList: (listId: string, name: string) => boolean // false si no se pudo
  deleteList: (listId: string) => void
  isInList: (listId: string, pokemonId: number) => boolean
  toggleInList: (listId: string, pokemonId: number) => void
}

export const ListsContext = createContext<ListsContextValue | null>(null)

// Lee localStorage una vez al arrancar
function readInitial(): PokemonList[] {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function ListsProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<PokemonList[]>(readInitial)

  // Cada vez que cambian, se guardan en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
  }, [lists])

  // Cambia una sola lista y deja las demás como estaban
  function updateList(listId: string, change: (l: PokemonList) => PokemonList) {
    setLists((prev) => prev.map((l) => (l.id === listId ? change(l) : l)))
  }

  function listNameError(name: string, ignoreId?: string) {
    const clean = name.trim()
    // El límite solo importa al crear, no al renombrar
    if (!ignoreId && lists.length >= MAX_LISTS)
      return `You can have up to ${MAX_LISTS} lists.`
    if (!clean) return 'Write a name for the list.'
    // "Prueba" y "prueba" cuentan como el mismo nombre
    const taken = lists.some(
      (l) => l.id !== ignoreId && l.name.toLowerCase() === clean.toLowerCase()
    )
    if (taken) return 'There is already a list with that name.'
    return null
  }

  function createList(name: string) {
    if (listNameError(name)) return null
    // Un id único que genera el navegador
    const id = crypto.randomUUID()
    setLists((prev) => [...prev, { id, name: name.trim(), pokemon: [] }])
    return id
  }

  function renameList(listId: string, name: string) {
    if (listNameError(name, listId)) return false
    updateList(listId, (l) => ({ ...l, name: name.trim() }))
    return true
  }

  function deleteList(listId: string) {
    setLists((prev) => prev.filter((l) => l.id !== listId))
  }

  function isInList(listId: string, pokemonId: number) {
    return lists.some((l) => l.id === listId && l.pokemon.includes(pokemonId))
  }

  function toggleInList(listId: string, pokemonId: number) {
    updateList(listId, (l) => ({
      ...l,
      pokemon: l.pokemon.includes(pokemonId)
        ? l.pokemon.filter((x) => x !== pokemonId)
        : [...l.pokemon, pokemonId],
    }))
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
      }}
    >
      {children}
    </ListsContext.Provider>
  )
}