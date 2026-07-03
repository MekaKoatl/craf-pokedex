import { useParams } from "react-router-dom";
import { usePokemonDetails } from "../hooks/usePokemonDetails";
import { useFavorites } from "../hooks/useFavorites";
import { getRegionalDisplayName } from "../lib/regional";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { TypeBadge } from "../components/badges/TypeBadge";
import { StatBars } from "../components/details/StatBar";

const GEN_MAP: Record<string, string> = {
  "generation-i": "I",
  "generation-ii": "II",
  "generation-iii": "III",
  "generation-iv": "IV",
  "generation-v": "V",
  "generation-vi": "VI",
  "generation-vii": "VII",
  "generation-viii": "VIII",
  "generation-ix": "IX",
};
const REGION_MAP: Record<string, string> = {
  "generation-i": "Kanto",
  "generation-ii": "Johto",
  "generation-iii": "Hoenn",
  "generation-iv": "Sinnoh",
  "generation-v": "Unova",
  "generation-vi": "Kalos",
  "generation-vii": "Alola",
  "generation-viii": "Galar",
  "generation-ix": "Paldea",
};

export function Details() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = usePokemonDetails(id!);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (isLoading)
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  if (isError || !data)
    return <p className="p-8 text-gray-600">Pokémon not found.</p>;

  const { pokemon, species } = data;

  const gen = species.generation?.name ?? "";
  const flavor =
    species.flavor_text_entries
      .find((e) => e.language.name === "en")
      ?.flavor_text.replace(/\f|\n/g, " ") ?? "No description.";
  const habitat = species.habitat?.name ?? "Unknown";
  const displayName = getRegionalDisplayName(pokemon.name);
  const genus =
    species.genera.find((g) => g.language.name === "en")?.genus ?? "";
  const mainSprite =
    pokemon.sprites.other?.["official-artwork"]?.front_default ||
    pokemon.sprites.front_default ||
    "";
  const active = isFavorite(pokemon.id);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-start gap-6 mb-6">
        <button
          onClick={() => history.back()}
          className="mt-2 text-gray-500 hover:text-red-600 transition font-semibold text-sm"
        >
          ← Return
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            #{String(pokemon.id).padStart(3, "0")} {displayName}
          </h1>
          <p className="text-lg text-gray-500 mt-1">{genus}</p>
        </div>
        <button
          onClick={() => toggleFavorite(pokemon.id)}
          className={`mt-2 fav-btn${active ? " fav-active" : ""}`}
          style={{ position: "static", fontSize: "1.5rem" }}
          title="Favorite"
        ></button>
      </div>

      <div className="flex-1 bg-gray-100 rounded-xl flex items-center justify-center min-h-[300px] mb-8">
        <img
          src={mainSprite}
          alt={pokemon.name}
          className="w-64 h-64 object-contain"
        />
      </div>

      {/* Tipos / Generación / Habitat */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Type
          </h3>
          <div className="flex flex-wrap gap-2">
            {pokemon.types.map((t) => (
              <TypeBadge key={t.type.name} type={t.type.name} />
            ))}
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Generation
          </h3>
          <div className="text-gray-700 text-sm">
            <span className="font-bold">Gen {GEN_MAP[gen]}</span>{" "}
            <span className="text-gray-400">— {REGION_MAP[gen]}</span>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Habitat
          </h3>
          <p className="text-gray-700 text-sm capitalize">{habitat}</p>
        </div>
      </div>

      {/* Flavor */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
          Pokédex Entry
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">{flavor}</p>
      </div>

      {/* Altura / Peso / Habilidades */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Height
          </h3>
          <p className="text-gray-700 text-sm">
            {(pokemon.height / 10).toFixed(1)} m
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Weight
          </h3>
          <p className="text-gray-700 text-sm">
            {(pokemon.weight / 10).toFixed(1)} kg
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Abilities
          </h3>
          <div className="flex flex-col gap-1">
            {pokemon.abilities.map((a) => (
              <span
                key={a.ability.name}
                className="text-gray-700 text-sm capitalize"
              >
                {a.ability.name.replace(/-/g, " ")}
                {a.is_hidden ? " (hidden)" : ""}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">
          Base Stats
        </h3>
        <StatBars stats={pokemon.stats} />
      </div>
    </main>
  );
}
