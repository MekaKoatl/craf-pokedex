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
