/**
 * Insignias de una entrada del dataset: Mega (M), Gigamax (G), forma
 * regional (R), legendario, singular y bebé.
 */
export type FormBadge = "M" | "G" | "R" | "Legend" | "Mythic" | "Baby";

/** Entrada del dataset local `src/data/pokemon-data.ts`, generado por scripts. */
export interface PokemonEntry {
  id: number;
  name: string;
  types: string[];
  region: string;
  regions: string[];
  evoChainLength: number;
  /** No evoluciona más. Se evalúa por forma: Farfetch'd sí evoluciona, el de Galar no. */
  isFinal: boolean;
  forms: FormBadge[];
  isRegional?: boolean;
}

/** Referencia de la PokéAPI: nombre y URL del recurso. */
export interface NamedResource {
  name: string;
  url: string;
}

/** Datos básicos de un Pokémon (`/pokemon/{id}`), suficientes para tarjetas y grillas. */
export interface Pokemon {
  id: number;
  name: string;
  types: { slot: number; type: NamedResource }[];
  sprites: {
    front_default: string | null;
    versions?: {
      "generation-v"?: {
        "black-white"?: {
          animated?: {
            front_default: string | null;
          };
        };
      };
      "generation-vii"?: {
        icons?: { front_default: string | null };
      };
      "generation-viii"?: {
        icons?: { front_default: string | null };
      };
    };
  };
}

/** Un movimiento que aprende un Pokémon y en qué juegos y cómo lo aprende. */
export interface PokemonMove {
  move: NamedResource;
  version_group_details: {
    level_learned_at: number;
    move_learn_method: NamedResource;
    version_group: NamedResource;
  }[];
}

/** Datos completos de un Pokémon (`/pokemon/{id}`), usados en Details y el Team Planner. */
export interface PokemonFull extends Pokemon {
  height: number;
  weight: number;
  moves: PokemonMove[];
  base_experience: number | null;
  location_area_encounters: string;
  species: NamedResource;
  abilities: { ability: NamedResource; is_hidden: boolean; slot: number }[];
  /**
   * Habilidades en generaciones anteriores. Cada entrada rige hasta esa
   * generación inclusive; `ability: null` indica que el casillero no existía.
   */
  past_abilities?: {
    generation: NamedResource;
    abilities: {
      ability: NamedResource | null;
      is_hidden: boolean;
      slot: number;
    }[];
  }[];
  /**
   * Tipos en generaciones anteriores. Cada entrada rige hasta esa generación
   * inclusive (Clefairy era Normal hasta la Gen V).
   */
  past_types?: {
    generation: NamedResource;
    types: { slot: number; type: NamedResource }[];
  }[];
  stats: { base_stat: number; stat: NamedResource }[];
  sprites: Pokemon["sprites"] & {
    back_default: string | null;
    front_shiny: string | null;
    back_shiny: string | null;
    front_female: string | null;
    back_female: string | null;
    front_shiny_female: string | null;
    back_shiny_female: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
        front_shiny: string | null;
      };
      home?: {
        front_default: string | null;
        front_shiny: string | null;
        front_female: string | null;
        front_shiny_female: string | null;
      };
      showdown?: {
        front_default: string | null;
        back_default: string | null;
        front_female: string | null;
        back_female: string | null;
        front_shiny: string | null;
        back_shiny: string | null;
        front_shiny_female: string | null;
        back_shiny_female: string | null;
      };
      dream_world?: {
        front_default: string | null;
        front_female: string | null;
      };
    };
    versions?: Pokemon["sprites"]["versions"] & {
      "generation-v"?: {
        "black-white"?: {
          animated?: {
            front_default: string | null;
            back_default: string | null;
            front_female: string | null;
            back_female: string | null;
          };
        };
      };
      "generation-vii"?: {
        icons?: { front_default: string | null };
      };
      "generation-viii"?: {
        icons?: { front_default: string | null };
      };
    };
  };
}

/** Especie de un Pokémon (`/pokemon-species/{id}`). */
export interface Species {
  genera: { genus: string; language: NamedResource }[];
  flavor_text_entries: { flavor_text: string; language: NamedResource }[];
  habitat: NamedResource | null;
  generation: NamedResource;
  evolution_chain: { url: string };
  egg_groups: NamedResource[];
  gender_rate: number;
  capture_rate: number;
  shape: NamedResource | null;
  color: NamedResource | null;
  base_happiness: number | null;
  growth_rate: NamedResource | null;
  varieties: { is_default: boolean; pokemon: NamedResource }[];
}

/** Condiciones de una vía de evolución, según la PokéAPI. */
export interface EvoDetail {
  gender: number | null;
  held_item: { name: string; url: string } | null;
  item: { name: string; url: string } | null;
  known_move: { name: string; url: string } | null;
  known_move_type: { name: string; url: string } | null;
  location: { name: string; url: string } | null;
  min_affection: number | null;
  min_beauty: number | null;
  min_happiness: number | null;
  min_level: number | null;
  needs_overworld_rain: boolean;
  party_species: { name: string; url: string } | null;
  party_type: { name: string; url: string } | null;
  relative_physical_stats: number | null;
  time_of_day: string;
  trade_species: { name: string; url: string } | null;
  trigger: { name: string; url: string } | null;
  turn_upside_down: boolean;
  // Forma que evoluciona, forma resultante y región (campos agregados por la PokéAPI en 2026)
  required_pokemon_form?: NamedResource | null;
  evolved_pokemon_form?: NamedResource | null;
  region?: NamedResource | null;
}

/** Nodo de una cadena evolutiva: una especie, cómo se llega a ella y sus evoluciones. */
export interface EvoNode {
  species: NamedResource;
  evolution_details: EvoDetail[];
  evolves_to: EvoNode[];
}

/** Cadena evolutiva (`/evolution-chain/{id}`). */
export interface EvolutionChain {
  chain: EvoNode;
}
