import { useQuery } from "@tanstack/react-query";
import { getPokemon, fetchPokemonById } from "../../lib/api";
import { REGIONAL_SUFFIX_LIST } from "../../lib/constants";
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
  const { data: forms } = useQuery({
    queryKey: ["regional-forms", pokemonName],
    queryFn: async () => {
      if (isRegional) {
        const base = await getPokemon(speciesName);
        return [base];
      }
      const results = await Promise.all(
        REGIONAL_SUFFIX_LIST.map((s) => fetchPokemonById(`${pokemonName}${s}`)),
      );
      return results.filter((p): p is Pokemon => p !== null);
    },
  });

  if (!forms || forms.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">
        Regional Forms
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {forms.map((p) => (
          <DexCard key={p.id} pokemon={p} />
        ))}
      </div>
    </div>
  );
}
