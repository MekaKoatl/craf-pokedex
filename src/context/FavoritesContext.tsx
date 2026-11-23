import { useState, useEffect, type ReactNode } from "react";
import { FavoritesContext } from "./contexts";

/** Clave de `localStorage` donde se guardan los favoritos. */
const STORAGE_KEY = "craf-favorites";

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
