import { createContext, useState, useEffect, type ReactNode } from 'react'

const STORAGE_KEY = 'craf-favorites'

// Lo que el context expone a la app
interface FavoritesContextValue {
  favorites: number[]
  isFavorite: (id: number) => boolean
  toggleFavorite: (id: number) => void
  clearFavorites: () => void
}

// Se crea el "canal". Empieza null; lo llenará el Provider.
export const FavoritesContext = createContext<FavoritesContextValue | null>(null)

// Lee localStorage una vez al arrancar
function readInitial(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>(readInitial)

  // Cada vez que cambian, se guardan en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  function isFavorite(id: number) {
    return favorites.includes(Number(id))
  }

  function toggleFavorite(id: number) {
    id = Number(id)
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function clearFavorites() {
    setFavorites([])
  }

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, clearFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}