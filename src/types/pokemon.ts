// Las insignias/formas posibles de un Pokémon
export type FormBadge = "M" | "G" | "R" | "Legend" | "Mythic" | "Baby";

//dataset local (pokemon-data)
export interface PokemonEntry {
  id: number;
  name: string;
  types: string[];
  region: string;
  regions: string[];
  evoChainLength: number;
  forms: FormBadge[];
  isRegional?: boolean;
}

export interface NamedResource {
  name: string;
  url: string;
}

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

export interface PokemonMove {
  move: NamedResource;
  version_group_details: {
    level_learned_at: number;
    move_learn_method: NamedResource;
    version_group: NamedResource;
  }[];
}

export interface PokemonFull extends Pokemon {
  height: number;
  weight: number;
  moves: PokemonMove[];
  base_experience: number | null;
  location_area_encounters: string;
  species: NamedResource;
  abilities: { ability: NamedResource; is_hidden: boolean; slot: number }[];
  // Cómo eran en juegos viejos. Cada entrada vale "hasta esa generación".
  // ability: null = ese casillero todavía no existía
  past_abilities?: {
    generation: NamedResource;
    abilities: {
      ability: NamedResource | null;
      is_hidden: boolean;
      slot: number;
    }[];
  }[];
  // Tipos en juegos viejos. Cada entrada vale "hasta esa generación"
  // (Clefairy era Normal hasta Gen V)
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
  // Agregados por PokéAPI en 2026: qué forma evoluciona, en cuál termina y dónde
  required_pokemon_form?: NamedResource | null;
  evolved_pokemon_form?: NamedResource | null;
  region?: NamedResource | null;
}

export interface EvoNode {
  species: NamedResource;
  evolution_details: EvoDetail[];
  evolves_to: EvoNode[];
}

export interface EvolutionChain {
  chain: EvoNode;
}
