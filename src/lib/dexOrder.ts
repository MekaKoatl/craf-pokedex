import { POKEMON_DATA } from "../data/pokemon-data";

/** Sufijo regional y todo lo que le sigue: "rattata-alola" → "rattata". */
const REGIONAL_SUFFIX = /-(alola|galar|hisui|paldea).*$/;

// Índices construidos una sola vez al cargar el módulo
const ID_BY_NAME = new Map(POKEMON_DATA.map((e) => [e.name, e.id]));
const ENTRY_BY_ID = new Map(POKEMON_DATA.map((e) => [e.id, e]));

/** Número de Pokédex de un id. Las formas regionales usan el de su especie original. */
export function dexNumber(id: number): number {
  const entry = ENTRY_BY_ID.get(id);
  if (!entry?.isRegional) return id;
  return ID_BY_NAME.get(entry.name.replace(REGIONAL_SUFFIX, "")) ?? id;
}

/**
 * Comparador para `.sort()` por número de Pokédex. Ante un empate
 * (Rattata y Alolan Rattata) va primero la forma original.
 */
export function compareDex(a: number, b: number): number {
  return dexNumber(a) - dexNumber(b) || a - b;
}
