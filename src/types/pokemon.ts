// Las insignias/formas posibles de un Pokémon
export type FormBadge = "M" | "G" | "R" | "B" | "Legend" | "Mythic" | "Baby";

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
    };
  };
}

export interface PokemonFull extends Pokemon {
  height: number;
  weight: number;
  base_experience: number | null;
  location_area_encounters: string;
  abilities: { ability: NamedResource; is_hidden: boolean }[];
  stats: { base_stat: number; stat: NamedResource }[];
  sprites: Pokemon["sprites"] & {
    back_default: string | null;
    front_shiny: string | null;
    back_shiny: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
        front_shiny: string | null;
      };
      home?: { front_default: string | null; front_shiny: string | null };
    };
    versions?: Pokemon["sprites"]["versions"] & {
      "generation-v"?: {
        "black-white"?: {
          animated?: {
            front_default: string | null;
            back_default: string | null;
          };
        };
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
}

export interface EvoDetail {
  min_level: number | null;
  item: NamedResource | null;
  trigger: NamedResource | null;
  min_happiness: number | null;
  time_of_day: string;
  known_move: NamedResource | null;
  held_item: NamedResource | null;
}

export interface EvoNode {
  species: NamedResource;
  evolution_details: EvoDetail[];
  evolves_to: EvoNode[];
}

export interface EvolutionChain {
  chain: EvoNode;
}

export interface Species {
  varieties: { is_default: boolean; pokemon: NamedResource }[]
}
