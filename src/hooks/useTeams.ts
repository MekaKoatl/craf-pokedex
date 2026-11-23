import { useContext } from "react";
import { TeamsContext } from "../context/contexts";

/**
 * Acceso a los equipos del usuario y sus acciones.
 *
 * @throws {Error} Si se usa fuera de `TeamsProvider`.
 */
export function useTeams() {
  const ctx = useContext(TeamsContext);
  if (!ctx) throw new Error("useTeams debe usarse dentro de TeamsProvider");
  return ctx;
}
