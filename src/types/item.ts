import type { NamedResource } from "./pokemon";

export interface Item {
  id: number;
  name: string;
  names: { name: string; language: NamedResource }[];
  sprites: { default: string | null };
  effect_entries: {
    effect: string;
    short_effect: string;
    language: NamedResource;
  }[];
  flavor_text_entries: {
    text: string;
    version_group: NamedResource;
    language: NamedResource;
  }[];
  category: NamedResource;
  attributes: NamedResource[];
  fling_power: number | null;
  fling_effect: NamedResource | null;
  held_by_pokemon: {
    pokemon: NamedResource;
    version_details: { rarity: number; version: NamedResource }[];
  }[];
  machines: { machine: { url: string }; version_group: NamedResource }[];
  game_indices: { game_index: number; generation: NamedResource }[];
}