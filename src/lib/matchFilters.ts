import { POKEMON_DATA } from "../data/pokemon-data";
import type { FilterState } from "../hooks/useFilters";

/** Índice de entradas del dataset por id. */
const ENTRY_BY_ID = new Map(POKEMON_DATA.map((e) => [e.id, e]));

/** Generación de cada región de origen (Hisui pertenece a la Gen VIII). */
const REGION_GEN: Record<string, number> = {
  kanto: 1,
  johto: 2,
  hoenn: 3,
  sinnoh: 4,
  unova: 5,
  kalos: 6,
  alola: 7,
  galar: 8,
  hisui: 8,
  paldea: 9,
};

/**
 * Indica si un Pokémon cumple los filtros de tipo, región y generación.
 * Entre filtros distintos se exigen todos (AND); dentro de un mismo
 * filtro alcanza con que coincida un valor (OR). Un id fuera del dataset
 * solo pasa si no hay filtros activos.
 */
export function matchesFilters(id: number, f: FilterState): boolean {
  const e = ENTRY_BY_ID.get(id);
  if (!e) return f.types.length + f.regions.length + f.gens.length === 0;
  if (f.types.length && !f.types.some((t) => e.types.includes(t))) return false;
  if (f.regions.length && !f.regions.some((r) => e.regions.includes(r)))
    return false;
  if (f.gens.length && !f.gens.includes(REGION_GEN[e.region] ?? 0))
    return false;
  return true;
}
