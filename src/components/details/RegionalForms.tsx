import { useQuery } from "@tanstack/react-query";
import { getPokemon, fetchPokemonById } from "../../lib/api";
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
  // Qué formas regionales existen según el dataset local (sin pedir nada a la API)
  const entries = isRegional ? [] : getRegionalFormsOf(pokemonName);

  const { data: forms } = useQuery({
    queryKey: ["regional-forms", pokemonName],
    queryFn: async () => {
      // Si YA estamos en una forma regional, mostramos la forma base
      if (isRegional) {
        const base = await getPokemon(speciesName);
        return [base];
      }
      // Si no, pedimos solo las que sabemos que existen (por id, nunca 404)
      const results = await Promise.all(
        entries.map((e) => fetchPokemonById(e.id)),
      );
      return results.filter((p): p is Pokemon => p !== null);
    },
    // No corre si no hay nada que buscar
    enabled: isRegional || entries.length > 0,
  });

  if (!forms || forms.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">
        Regional Forms
      </h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        {forms.map((p) => (
          <DexCard key={p.id} pokemon={p} />
        ))}
      </div>
    </div>
  );
}