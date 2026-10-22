import { useQuery } from "@tanstack/react-query";
import { getPokemonFull, getSpecies, getEvolutionChain } from "../lib/api";
import { REGIONAL_SUFFIX_LIST } from "../lib/constants";
import type { PokemonFull } from "../types/pokemon";

export function usePokemonDetails(id: string) {
  return useQuery({
    queryKey: ["details", id],
    queryFn: async () => {
      const pokemon = await getPokemonFull(id);

      const suffix = REGIONAL_SUFFIX_LIST.find((s) => pokemon.name.endsWith(s));
      const isRegional = Boolean(suffix);
      const speciesName = pokemon.species.name;

      const species = await getSpecies(speciesName);
      const evoChain = await getEvolutionChain(species.evolution_chain.url);

      // Solo las especies con dos variedades de género tienen datos distintos
      const genderVarieties = species.varieties.filter(
        (v) =>
          v.pokemon.name.endsWith("-male") ||
          v.pokemon.name.endsWith("-female"),
      );
      const hasGenders = genderVarieties.length > 1;

      let femaleForm: PokemonFull | null = null;
      if (hasGenders) {
        const f = genderVarieties.find((v) =>
          v.pokemon.name.endsWith("-female"),
        );
        if (f) femaleForm = await getPokemonFull(f.pokemon.name);
      }

      return {
        pokemon,
        species,
        evoChain,
        isRegional,
        suffix,
        speciesName,
        hasGenders,
        femaleForm,
      };
    },
  });
}
