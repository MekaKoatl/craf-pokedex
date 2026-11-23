import { useContext } from "react";
import { FavoritesContext } from "../context/contexts";

/**
 * Acceso a los favoritos del usuario y sus acciones.
 *
 * @throws {Error} Si se usa fuera de `FavoritesProvider`.
 */
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx)
    throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  return ctx;
}
