import type { NamedResource } from "./pokemon";

export interface Ability {
  id: number;
  name: string;
  is_main_series: boolean;
  generation: NamedResource;
  names: { name: string; language: NamedResource }[];
  effect_entries: {
    effect: string;
    short_effect: string;
    language: NamedResource;
  }[];
  flavor_text_entries: {
    flavor_text: string;
    language: NamedResource;
    version_group: NamedResource;
  }[];
  pokemon: {
    is_hidden: boolean;
    slot: number;
    pokemon: NamedResource;
  }[];
}