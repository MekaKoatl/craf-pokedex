import { POKEMON_DATA } from "../data/pokemon-data";
import type { PokemonEntry } from "../types/pokemon";
import type { FilterState } from "../hooks/useFilters";

/** Región principal de cada generación. */
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

/**
 * Devuelve las entradas del dataset que cumplen todos los filtros activos.
 * Dentro de cada filtro alcanza con que coincida un valor (OR).
 */
export function filterPokemonData(filters: FilterState): PokemonEntry[] {
  const { types, regions, gens, evos, forms } = filters;

  return POKEMON_DATA.filter((entry) => {
    if (types.length && !types.some((t) => entry.types.includes(t)))
      return false;

    if (regions.length && !regions.some((r) => entry.regions.includes(r)))
      return false;

    if (gens.length && !gens.some((g) => GEN_TO_REGION[g] === entry.region))
      return false;

    // Evoluciones: cantidad de etapas de la cadena evolutiva
    if (evos.length && !evos.includes(entry.evoChainLength)) return false;

    // Formas: "R" (regional) también incluye las entradas marcadas como isRegional
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
