import { POKEMON_DATA } from "../data/pokemon-data";

// "rattata-alola" → "rattata"
const REGIONAL_SUFFIX = /-(alola|galar|hisui|paldea).*$/;

// Se arman una sola vez, al cargar el archivo
const ID_BY_NAME = new Map(POKEMON_DATA.map((e) => [e.name, e.id]));
const ENTRY_BY_ID = new Map(POKEMON_DATA.map((e) => [e.id, e]));

// Número de Pokédex: las regionales usan el de su forma original
export function dexNumber(id: number): number {
  const entry = ENTRY_BY_ID.get(id);
  if (!entry?.isRegional) return id;
  return ID_BY_NAME.get(entry.name.replace(REGIONAL_SUFFIX, "")) ?? id;
}

// Para usar en .sort(): por número de Pokédex.
// Si empatan (Rattata y Alolan Rattata), va primero la original.
export function compareDex(a: number, b: number): number {
  return dexNumber(a) - dexNumber(b) || a - b;
}