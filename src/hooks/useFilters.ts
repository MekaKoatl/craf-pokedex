import { useState } from "react";

/** Filtros de la Pokédex. Cada grupo es la lista de valores seleccionados. */
export interface FilterState {
  types: string[];
  regions: string[];
  gens: number[];
  evos: number[];
  forms: string[];
}

/** Estado sin filtros. */
const EMPTY: FilterState = {
  types: [],
  regions: [],
  gens: [],
  evos: [],
  forms: [],
};

/** Estado de los filtros de la Pokédex y sus acciones. */
export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(EMPTY);

  /** Agrega o quita un valor de un grupo. */
  function toggle<K extends keyof FilterState>(
    group: K,
    value: FilterState[K][number],
  ) {
    setFilters((prev) => {
      const current = prev[group] as FilterState[K][number][];
      const exists = current.includes(value);
      const updated = exists
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [group]: updated };
    });
  }

  /** Vacía un grupo. */
  function clearGroup<K extends keyof FilterState>(group: K) {
    setFilters((prev) => ({ ...prev, [group]: [] }));
  }

  /** Vacía todos los grupos. */
  function clearAll() {
    setFilters(EMPTY);
  }

  /** Hay al menos un filtro activo. */
  const hasAnyActive =
    filters.types.length > 0 ||
    filters.regions.length > 0 ||
    filters.gens.length > 0 ||
    filters.evos.length > 0 ||
    filters.forms.length > 0;

  return { filters, toggle, clearGroup, clearAll, hasAnyActive };
}
