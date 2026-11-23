import { useContext } from "react";
import { ListsContext } from "../context/ListsContext";

/**
 * Acceso a los listas del usuario y sus acciones.
 *
 * @throws {Error} Si se usa fuera de `ListsProvider`.
 */
export function useLists() {
  const ctx = useContext(ListsContext);
  if (!ctx) throw new Error("useLists debe usarse dentro de ListsProvider");
  return ctx;
}
