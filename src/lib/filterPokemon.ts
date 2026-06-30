import { POKEMON_DATA } from "../data/pokemon-data";
import type { PokemonEntry } from "../types/pokemon";
import type { FilterState } from "../hooks/useFilters";

const GEN_TO_REGION: Record<number, string> = {
  1: "kanto",
  2: "johto",
  3: "hoenn",
  4: "sinnoh",
  5: "unova",
  6: "kalos",
  7: "alola",
  8: "galar",
  9: "paldea",
};

// Función pura: recibe los filtros, devuelve las entradas del dataset que cumplen
export function filterPokemonData(filters: FilterState): PokemonEntry[] {
  const { types, regions, gens, evos, forms } = filters;

  return POKEMON_DATA.filter((entry) => {
    // Type: al menos uno de los tipos seleccionados coincide
    if (types.length && !types.some((t) => entry.types.includes(t)))
      return false;

    // Region: al menos una región coincide
    if (regions.length && !regions.some((r) => entry.regions.includes(r)))
      return false;

    // Generation: la generación coincide
    if (gens.length && !gens.some((g) => GEN_TO_REGION[g] === entry.region))
      return false;

    // Evolutions: longitud de cadena evolutiva
    if (evos.length && !evos.includes(entry.evoChainLength)) return false;

    // Formas
    if (
      forms.length &&
      !forms.some((f) =>
        f === "R"
          ? entry.forms.includes("R") || entry.isRegional
          : entry.forms.includes(f as never),
      )
    )
      return false;

    return true;
  });
}
