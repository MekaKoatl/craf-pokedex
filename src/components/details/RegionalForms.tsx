import { useQuery } from "@tanstack/react-query";
import { fetchPokemonById, fetchPokemonBySpecies } from "../../lib/api";
import { getRegionalFormsOf } from "../../lib/regional";
import { DexCard } from "../DexCard";
import type { Pokemon } from "../../types/pokemon";

export function RegionalForms({
  pokemonName,
  isRegional,
  speciesName,
}: {
  pokemonName: string;
  isRegional: boolean;
  speciesName: string;
}) {
  // Las regionales de la especie (dataset local), menos la que estás viendo.
  // Por especie y no por Pokémon: "darmanitan-standard" no encontraría nada.
  const siblings = getRegionalFormsOf(speciesName).filter(
    (e) => e.name !== pokemonName,
  );

  const { data: forms } = useQuery({
    queryKey: ["regional-forms", pokemonName],
    queryFn: async () => {
      const results = await Promise.all([
        // Si estás en una regional, primero va la forma original
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {forms.map((p) => (
          <DexCard key={p.id} pokemon={p} />
        ))}
      </div>
    </div>
  );
}