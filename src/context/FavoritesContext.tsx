import { createContext, useState, useEffect, type ReactNode } from "react";

/** Clave de `localStorage` donde se guardan los favoritos. */
const STORAGE_KEY = "craf-favorites";

/** Valor que expone el contexto de favoritos. */
interface FavoritesContextValue {
  /** Ids de Pokémon favoritos, en el orden en que se agregaron. */
  favorites: number[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
  clearFavorites: () => void;
}

/** Contexto de favoritos. Es null fuera de `FavoritesProvider`; usar `useFavorites`. */
export const FavoritesContext = createContext<FavoritesContextValue | null>(
  null,
);

/** Favoritos guardados, o [] si no hay o el JSON es inválido. */
function readInitial(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Provee los favoritos a la app y los persiste en `localStorage` en cada cambio. */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>(readInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  function isFavorite(id: number) {
    return favorites.includes(Number(id));
  }

  function toggleFavorite(id: number) {
    id = Number(id);
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function clearFavorites() {
    setFavorites([]);
  }

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, clearFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
