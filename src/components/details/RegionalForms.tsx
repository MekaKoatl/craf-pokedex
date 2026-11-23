import { useQuery } from "@tanstack/react-query";
import { fetchPokemonById, fetchPokemonBySpecies } from "../../lib/api";
import { getRegionalFormsOf } from "../../lib/regional";
import { DexCard } from "../DexCard";
import type { Pokemon } from "../../types/pokemon";

/**
 * Tarjetas de las otras formas de la especie: las regionales y, si se está
 * viendo una regional, también la forma original. No se muestra si no hay ninguna.
 */
export function RegionalForms({
  pokemonName,
  isRegional,
  speciesName,
}: {
  pokemonName: string;
  isRegional: boolean;
  speciesName: string;
}) {
  // Formas regionales de la especie, sin la actual. Se busca por especie
  // porque algunos nombres de Pokémon ("darmanitan-standard") no coinciden.
  const siblings = getRegionalFormsOf(speciesName).filter(
    (e) => e.name !== pokemonName,
  );

  const { data: forms } = useQuery({
    queryKey: ["regional-forms", pokemonName],
    queryFn: async () => {
      const results = await Promise.all([
        // En una forma regional, la original va primero
        isRegional ? fetchPokemonBySpecies(speciesName) : null,
        ...siblings.map((e) => fetchPokemonById(e.id)),
      ]);
      return results.filter((p): p is Pokemon => p !== null);
    },
    enabled: isRegional || siblings.length > 0,
  });

  if (!forms || forms.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">
        {isRegional ? "Other Forms" : "Regional Forms"}
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {" "}
        {forms.map((p) => (
          <DexCard key={p.id} pokemon={p} pixel />
        ))}
      </div>
    </div>
  );
}
