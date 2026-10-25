import { useEffect } from "react";
import {
  Link,
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { usePokemonDetails } from "../hooks/usePokemonDetails";
import { useFavorites } from "../hooks/useFavorites";
import { getRegionalDisplayName } from "../lib/regional";
import { idFromUrl } from "../lib/text";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { TypeBadge } from "../components/badges/TypeBadge";
import { StatBars } from "../components/details/StatBar";
import { SpriteGallery } from "../components/details/SpriteGallery";
import { EvoChain } from "../components/details/EvoChain";
import { RegionalForms } from "../components/details/RegionalForms";
import { MoreInfoPanel } from "../components/details/MoreInfoPanel";
import { AltFormsAccordion } from "../components/details/AltFormsAccordion";
import { LearnedMovesPanel } from "../components/details/LearnedMovesPanel";
import { TypeMatchups } from "../components/details/TypeMatchups";

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isError } = usePokemonDetails(id!);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Si se entra por el id de la hembra, la URL se normaliza a la especie
  useEffect(() => {
    if (!data) return;
    const def = data.species.varieties.find((v) => v.is_default);
    if (!def) return;
    const defId = idFromUrl(def.pokemon.url);
    if (data.pokemon.name.endsWith("-female") && defId !== data.pokemon.id) {
      navigate(`/details/${defId}?gender=female`, { replace: true });
    }
  }, [data, navigate]);

  if (isLoading)
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  if (isError || !data)
    return <p className="p-8 text-gray-600">Pokémon not found.</p>;

  const { pokemon, species, femaleForm, hasGenders } = data;

  // El género vive en la URL, así el enlace se puede compartir
  const gender = searchParams.get("gender") === "female" ? "female" : "male";
  function pickGender(g: "male" | "female") {
    setSearchParams(g === "female" ? { gender: "female" } : {}, {
      replace: true,
    });
  }

  // De acá salen stats, habilidades, medidas y tipos
  const shown = gender === "female" && femaleForm ? femaleForm : pokemon;

  const gen = species.generation?.name ?? "";
  const flavor =
    species.flavor_text_entries
      .find((e) => e.language.name === "en")
      ?.flavor_text.replace(/\f|\n/g, " ") ?? "No description.";
  const habitat = species.habitat?.name ?? "Unknown";
  const displayName = getRegionalDisplayName(pokemon.name);
  const genus =
    species.genera.find((g) => g.language.name === "en")?.genus ?? "";
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
          aria-label="Favorite"
        >
          ♥
        </button>
      </div>

      <SpriteGallery key={pokemon.id} pokemon={pokemon} female={femaleForm} />

      <hr className="border-gray-200 my-6" />

      {/* Tipos / Generación / Habitat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 items-start">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Type
          </h3>
          <div className="flex flex-wrap gap-2">
            {shown.types.map((t) => (
              <TypeBadge key={t.type.name} type={t.type.name} />
            ))}
          </div>
          <TypeMatchups types={shown.types.map((t) => t.type.name)} />
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

      <hr className="border-gray-200 my-6" />

      {/* Flavor */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
          Pokédex Entry
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">{flavor}</p>
      </div>

      <hr className="border-gray-200 my-6" />

      {/* Evolutions */}
      <EvoChain
        chain={data.evoChain}
        currentName={data.speciesName}
        currentId={pokemon.id}
        suffix={data.suffix}
      />

      <hr className="border-gray-200 my-6" />

      {/* Conmutador de género: solo cuando hay datos distintos */}
      {hasGenders && (
        <div className="flex justify-center gap-2 mb-6">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              onClick={() => pickGender(g)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold border-2 transition cursor-pointer ${
                gender === g
                  ? "bg-red-600 border-red-600 text-white"
                  : "border-gray-300 text-gray-500 hover:border-red-400"
              }`}
            >
              {g === "female" ? "♀ Female" : "♂ Male"}
            </button>
          ))}
        </div>
      )}

      {/* Altura / Peso / Habilidades — siempre visibles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Avg. Height
          </h3>
          <p className="text-gray-700 text-sm">
            {(shown.height / 10).toFixed(1)} m
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Avg. Weight
          </h3>
          <p className="text-gray-700 text-sm">
            {(shown.weight / 10).toFixed(1)} kg
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Abilities
          </h3>
          <div className="flex flex-col gap-1 items-start">
            {shown.abilities.map((a) => (
              <Link
                key={a.ability.name}
                to={`/abilities?open=${a.ability.name}`}
                className="text-gray-700 text-sm capitalize hover:text-red-600 hover:underline transition"
              >
                {a.ability.name.replace(/-/g, " ")}
                {a.is_hidden ? " (hidden)" : ""}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">
          Base Stats
        </h3>
        <StatBars stats={shown.stats} />
      </div>

      <RegionalForms
        pokemonName={pokemon.name}
        isRegional={data.isRegional}
        speciesName={data.speciesName}
      />

      <hr className="border-gray-200 my-6" />

      <AltFormsAccordion species={species} baseStats={shown.stats} />
      <LearnedMovesPanel pokemon={shown} />
      <MoreInfoPanel pokemon={shown} species={species} />
    </main>
  );
}
