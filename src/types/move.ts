import type { NamedResource } from "./pokemon";

/** Movimiento tal como lo devuelve la PokéAPI (`/move/{id}`), con los campos que usa el sitio. */
export interface Move {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number | null;
  priority: number;
  effect_chance: number | null;
  damage_class: NamedResource;
  type: NamedResource;
  generation: NamedResource;
  target: NamedResource;
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
  // null en algunos movimientos
  meta: {
    ailment: NamedResource;
    ailment_chance: number;
    category: NamedResource;
    crit_rate: number;
    drain: number;
    flinch_chance: number;
    healing: number;
    max_hits: number | null;
    max_turns: number | null;
    min_hits: number | null;
    min_turns: number | null;
    stat_chance: number;
  } | null;
  stat_changes: { change: number; stat: NamedResource }[];
  learned_by_pokemon: NamedResource[];
  /**
   * Valores que tenía el movimiento antes de cada grupo de versiones.
   * Ej.: `{ type: normal, version_group: gold-silver }` en Bite significa
   * que era de tipo Normal antes de Gold/Silver.
   */
  past_values: {
    accuracy: number | null;
    power: number | null;
    pp: number | null;
    type: NamedResource | null;
    version_group: NamedResource;
  }[];
}
