import { BASE_URL } from "./constants";
import type { Pokemon } from "../types/pokemon";
import type { PokemonFull, Species } from "../types/pokemon";
import type { Item } from "../types/item";
import type { Ability } from "../types/ability";
import type { Move } from "../types/move";

/** Error que se lanza cuando la PokéAPI responde 404 (el recurso no existe). */
export class NotFoundError extends Error {}

/** Datos básicos de un Pokémon, o null si no existe. Pensado para pedidos en lote. */
export async function fetchPokemonById(
  id: string | number,
): Promise<Pokemon | null> {
  const res = await fetch(`${BASE_URL}/pokemon/${id}`);
  if (!res.ok) return null;
  return res.json();
}

/**
 * Aplica `fetchFn` a cada elemento en tandas de `batchSize` pedidos en paralelo,
 * para no saturar la API. Mantiene el orden de entrada.
 */
export async function fetchInBatches<T, R>(
  items: T[],
  fetchFn: (item: T) => Promise<R>,
  batchSize = 20,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fetchFn));
    results.push(...batchResults);
  }
  return results;
}

/**
 * Datos completos de un Pokémon (movimientos, stats, sprites, etc.).
 *
 * @throws {NotFoundError} Si el Pokémon no existe.
 * @throws {Error} Ante cualquier otro error de red o de la API.
 */
export async function getPokemonFull(
  nameOrId: string | number,
): Promise<PokemonFull> {
  const res = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
  if (res.status === 404) throw new NotFoundError("Pokemon not found");
  if (!res.ok) throw new Error("Could not load Pokemon");
  return res.json();
}

/** Datos de la especie (textos, generación, variedades, cadena evolutiva). Lanza un error si no existe. */
export async function getSpecies(nameOrId: string | number): Promise<Species> {
  const res = await fetch(`${BASE_URL}/pokemon-species/${nameOrId}`);
  if (!res.ok) throw new Error("Species not found");
  return res.json();
}

/** Cadena evolutiva a partir de su URL completa. Lanza un error si falla. */
export async function getEvolutionChain(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Evolution chain not found");
  return res.json();
}

/** Datos de un objeto, o null si no existe. Pensado para pedidos en lote. */
export async function getItem(nameOrId: string | number): Promise<Item | null> {
  const res = await fetch(`${BASE_URL}/item/${nameOrId}`);
  if (!res.ok) return null;
  return res.json();
}

/** Nombres de todos los objetos, en una sola petición liviana. */
export async function getItemNames(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/item?limit=3000`);
  if (!res.ok) throw new Error("Item list not found");
  const data = await res.json();
  return data.results.map((r: { name: string }) => r.name);
}

/** Nombres de los objetos de una categoría, o [] si falla. */
export async function getItemsInCategory(category: string): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/item-category/${category}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.items.map((i: { name: string }) => i.name);
}

/** Nombres de los objetos de varias categorías, sin repetidos. */
export async function getItemsInGroup(categories: string[]): Promise<string[]> {
  const lists = await Promise.all(categories.map(getItemsInCategory));
  return [...new Set(lists.flat())];
}

/** Datos de una habilidad, o null si no existe. Pensado para pedidos en lote. */
export async function getAbility(
  nameOrId: string | number,
): Promise<Ability | null> {
  const res = await fetch(`${BASE_URL}/ability/${nameOrId}`);
  if (!res.ok) return null;
  return res.json();
}

/** Nombres de todas las habilidades, en una sola petición liviana. */
export async function getAbilityNames(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/ability?limit=500`);
  if (!res.ok) throw new Error("Ability list not found");
  const data = await res.json();
  return data.results.map((r: { name: string }) => r.name);
}

/**
 * Datos básicos de un Pokémon a partir del nombre de su especie. Algunas
 * especies no tienen un Pokémon con el mismo nombre (frillish → frillish-male);
 * en ese caso se usa la variedad por defecto. Devuelve null si no se encuentra.
 */
export async function fetchPokemonBySpecies(
  speciesName: string,
): Promise<Pokemon | null> {
  const direct = await fetchPokemonById(speciesName);
  if (direct) return direct;

  const res = await fetch(`${BASE_URL}/pokemon-species/${speciesName}`);
  if (!res.ok) return null;
  const species = await res.json();
  const def = species.varieties.find(
    (v: { is_default: boolean }) => v.is_default,
  );
  return def ? fetchPokemonById(def.pokemon.name) : null;
}

/** Datos de un movimiento, o null si no existe. Pensado para pedidos en lote. */
export async function getMove(nameOrId: string | number): Promise<Move | null> {
  const res = await fetch(`${BASE_URL}/move/${nameOrId}`);
  if (!res.ok) return null;
  return res.json();
}

/** Nombres de todos los movimientos, en una sola petición liviana. */
export async function getMoveNames(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/move?limit=2000`);
  if (!res.ok) throw new Error("Move list not found");
  const data = await res.json();
  return data.results.map((r: { name: string }) => r.name);
}

/** Nombres de los movimientos de un tipo, o [] si falla. */
export async function getMovesOfType(type: string): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/type/${type}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.moves.map((m: { name: string }) => m.name);
}

/** Nombres de los movimientos de una categoría de daño (physical, special o status), o [] si falla. */
export async function getMovesInDamageClass(cls: string): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/move-damage-class/${cls}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.moves.map((m: { name: string }) => m.name);
}

/**
 * Relaciones de daño de un tipo según la API. Las claves `_from` describen
 * al tipo como defensor y las `_to`, como atacante.
 */
export async function getTypeRelations(type: string): Promise<{
  double_damage_from: { name: string }[];
  half_damage_from: { name: string }[];
  no_damage_from: { name: string }[];
  double_damage_to: { name: string }[];
  half_damage_to: { name: string }[];
  no_damage_to: { name: string }[];
}> {
  const res = await fetch(`${BASE_URL}/type/${type}`);
  if (!res.ok) throw new Error("Type not found");
  const data = await res.json();
  return data.damage_relations;
}
