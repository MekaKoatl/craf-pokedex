import type { NamedResource } from "./pokemon";

/** Habilidad tal como la devuelve la PokéAPI (`/ability/{id}`), con los campos que usa el sitio. */
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
