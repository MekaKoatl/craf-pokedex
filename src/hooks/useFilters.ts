import { useState } from 'react'

// La forma del estado: cada grupo es una lista de valores seleccionados
export interface FilterState {
  types: string[]
  regions: string[]
  gens: number[]
  evos: number[]
  forms: string[]
}

const EMPTY: FilterState = {
  types: [],
  regions: [],
  gens: [],
  evos: [],
  forms: [],
}

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(EMPTY)

  // Activa/desactiva un valor dentro de un grupo
  function toggle<K extends keyof FilterState>(group: K, value: FilterState[K][number]) {
    setFilters((prev) => {
      const current = prev[group] as FilterState[K][number][]
      const exists = current.includes(value)
      const updated = exists
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [group]: updated }
    })
  }

  // Limpia un grupo concreto
  function clearGroup<K extends keyof FilterState>(group: K) {
    setFilters((prev) => ({ ...prev, [group]: [] }))
  }

  // Clear ALL
  function clearAll() {
    setFilters(EMPTY)
  }

  //Chequeo
  const hasAnyActive =
    filters.types.length > 0 ||
    filters.regions.length > 0 ||
    filters.gens.length > 0 ||
    filters.evos.length > 0 ||
    filters.forms.length > 0

  return { filters, toggle, clearGroup, clearAll, hasAnyActive }
}