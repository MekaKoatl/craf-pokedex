import { useQuery } from "@tanstack/react-query";
import {
  getPokemonFull,
  getSpecies,
  getEvolutionChain,
  NotFoundError,
} from "../lib/api";

import { REGIONAL_SUFFIX_LIST } from "../lib/constants";
import type { PokemonFull } from "../types/pokemon";

/**
 * Todo lo que muestra la página de detalles: Pokémon, especie, cadena
 * evolutiva, si es una forma regional y, si la especie tiene diferencias
 * de género, los datos de la forma hembra.
 *
 * @param id Id o nombre de la API.
 */
export function usePokemonDetails(id: string) {
  return useQuery({
    queryKey: ["details", id],
    queryFn: async () => {
      const pokemon = await getPokemonFull(id);

      // El sufijo regional puede ir al final ("raichu-alola") o en el medio
      // ("tauros-paldea-combat-breed"). Las gorras de Pikachu ("pikachu-alola-cap")
      // y las formas totem lo incluyen pero no son formas regionales.
      const notRegional = /-(cap|totem)(-|$)/.test(pokemon.name);
      const suffix = notRegional
        ? undefined
        : REGIONAL_SUFFIX_LIST.find(
            (s) => pokemon.name.endsWith(s) || pokemon.name.includes(`${s}-`),
          );
      const isRegional = Boolean(suffix);
      const speciesName = pokemon.species.name;

      const species = await getSpecies(speciesName);
      const evoChain = await getEvolutionChain(species.evolution_chain.url);

      // Solo las especies con variedades -male y -female tienen datos distintos por género
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
    // Un 404 no se reintenta: la página muestra "no encontrado" de inmediato
    retry: (failureCount, error) =>
      !(error instanceof NotFoundError) && failureCount < 3,
  });
}
