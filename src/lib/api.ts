import { BASE_URL } from "./constants";
import type { Pokemon } from "../types/pokemon";
import type { PokemonFull, Species } from "../types/pokemon";
import type { Item } from "../types/item";
import type { Ability } from "../types/ability";

// Lanza error si no existe (lo usará React Query)
export async function getPokemon(nameOrId: string | number): Promise<Pokemon> {
  const res = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
  if (!res.ok) throw new Error("Pokemon not found");
  return res.json();
}

// Devuelve null si no existe (lo usaremos para cargar grids en lote)
export async function fetchPokemonById(
  id: string | number,
): Promise<Pokemon | null> {
  const res = await fetch(`${BASE_URL}/pokemon/${id}`);
  if (!res.ok) return null;
  return res.json();
}

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

export async function getPokemonFull(
  nameOrId: string | number,
): Promise<PokemonFull> {
  const res = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
  if (!res.ok) throw new Error("Pokemon not found");
  return res.json();
}

export async function getSpecies(nameOrId: string | number): Promise<Species> {
  const res = await fetch(`${BASE_URL}/pokemon-species/${nameOrId}`);
  if (!res.ok) throw new Error("Species not found");
  return res.json();
}

export async function getEvolutionChain(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Evolution chain not found");
  return res.json();
}

// Devuelve null si no existe, para poder pedir lotes sin que explote
export async function getItem(nameOrId: string | number): Promise<Item | null> {
  const res = await fetch(`${BASE_URL}/item/${nameOrId}`);
  if (!res.ok) return null;
  return res.json();
}

// Solo los nombres: una petición barata que sirve de índice
export async function getItemNames(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/item?limit=3000`);
  if (!res.ok) throw new Error("Item list not found");
  const data = await res.json();
  return data.results.map((r: { name: string }) => r.name);
}

// La categoría ya trae su propia lista de objetos
export async function getItemsInCategory(category: string): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/item-category/${category}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.items.map((i: { name: string }) => i.name);
}

// Une las listas de varias categorías en una sola, sin repetidos
export async function getItemsInGroup(categories: string[]): Promise<string[]> {
  const lists = await Promise.all(categories.map(getItemsInCategory));
  return [...new Set(lists.flat())];
}

export async function getAbility(
  nameOrId: string | number,
): Promise<Ability | null> {
  const res = await fetch(`${BASE_URL}/ability/${nameOrId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getAbilityNames(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/ability?limit=500`);
  if (!res.ok) throw new Error("Ability list not found");
  const data = await res.json();
  return data.results.map((r: { name: string }) => r.name);
}

// Algunas especies ya no tienen un Pokémon con su mismo nombre
// (frillish → frillish-male). Si falla, se busca su forma por defecto.
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
