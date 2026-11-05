import { POKEMON_DATA } from "../data/pokemon-data";
import type { FilterState } from "../hooks/useFilters";

const ENTRY_BY_ID = new Map(POKEMON_DATA.map((e) => [e.id, e]));

// Región de origen → generación (las formas de Hisui son de Gen VIII)
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

// ¿Este Pokémon pasa los filtros de tipo, región y generación?
// Dentro de un mismo filtro alcanza con que coincida uno (OR).
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
