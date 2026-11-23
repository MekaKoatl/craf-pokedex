import { useEffect } from "react";
import {
  Link,
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { usePokemonDetails } from "../hooks/usePokemonDetails";
import { AddToListButton } from "../components/AddToListButton";
import { SavedIn } from "../components/details/SavedIn";
import { getRegionalDisplayName } from "../lib/regional";
import { idFromUrl } from "../lib/text";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { NotFoundMessage } from "../components/NotFoundMessage";
import { TypeBadge } from "../components/badges/TypeBadge";
import { StatBars } from "../components/details/StatBar";
import { SpriteGallery } from "../components/details/SpriteGallery";
import { EvoChain } from "../components/details/EvoChain";
import { RegionalForms } from "../components/details/RegionalForms";
import { MoreInfoPanel } from "../components/details/MoreInfoPanel";
import { AltFormsAccordion } from "../components/details/AltFormsAccordion";
import { LearnedMovesPanel } from "../components/details/LearnedMovesPanel";
import { TypeMatchups } from "../components/details/TypeMatchups";

/** Número romano y región de cada generación de la API. */
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

/** Generación y región de debut de las formas regionales (distintas de las de su especie). */
const REGIONAL_GEN: Record<string, { gen: string; region: string }> = {
  alola: { gen: "VII", region: "Alola" },
  galar: { gen: "VIII", region: "Galar" },
  hisui: { gen: "VIII", region: "Hisui" },
  paldea: { gen: "IX", region: "Paldea" },
};

/**
 * Página de detalles de un Pokémon (`/details/:id`): imágenes, tipos,
 * generación, entrada de Pokédex, evoluciones, medidas, habilidades, stats,
 * formas, movimientos y más datos. `?gender=female` muestra la forma hembra
 * en las especies que la tienen. Si el id no existe, muestra un 404.
 */
export function Details() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isError } = usePokemonDetails(id!);

  // Si se entra por el id de la variedad hembra, redirige a la especie con ?gender=female
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
    return (
      <NotFoundMessage
        title="This Pokémon doesn't exist... yet!"
        message={`There's no Pokémon with the ID "${id}".`}
      />
    );

  const { pokemon, species, femaleForm, hasGenders } = data;

  // El género va en la URL para que el enlace se pueda compartir
  const gender = searchParams.get("gender") === "female" ? "female" : "male";
  function pickGender(g: "male" | "female") {
    setSearchParams(g === "female" ? { gender: "female" } : {}, {
      replace: true,
    });
  }

  // Forma mostrada: define stats, habilidades, medidas y tipos
  const shown = gender === "female" && femaleForm ? femaleForm : pokemon;

  const gen = species.generation?.name ?? "";
  // includes y no endsWith, por nombres como "tauros-paldea-combat-breed"
  const regionalKey = data.isRegional
    ? Object.keys(REGIONAL_GEN).find((k) => pokemon.name.includes(`-${k}`))
    : undefined;
  const regional = regionalKey ? REGIONAL_GEN[regionalKey] : undefined;
  const genLabel = regional?.gen ?? GEN_MAP[gen];
  const regionLabel = regional?.region ?? REGION_MAP[gen];
  const flavor =
    species.flavor_text_entries
      .find((e) => e.language.name === "en")
      ?.flavor_text.replace(/\f|\n/g, " ") ?? "No description.";
  const habitat = species.habitat?.name ?? "Unknown";
  const displayName = getRegionalDisplayName(pokemon.name);
  const genus =
    species.genera.find((g) => g.language.name === "en")?.genus ?? "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        {/* Celular: primera fila con volver y guardar */}
        <div className="flex items-center justify-between gap-4 mb-3 sm:hidden">
          <button
            onClick={() => history.back()}
            className="min-h-[45px] text-gray-500 hover:text-red-600 transition font-semibold text-sm"
          >
            ← Return
          </button>
          <AddToListButton id={pokemon.id} variant="details" />
        </div>

        <div className="flex items-start gap-6">
          {/* Escritorio: todo en una fila */}
          <button
            onClick={() => history.back()}
            className="hidden sm:block mt-2 text-gray-500 hover:text-red-600 transition font-semibold text-sm"
          >
            ← Return
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              #{String(pokemon.id).padStart(3, "0")} {displayName}
            </h1>
            <p className="text-base sm:text-lg text-gray-500 mt-1">{genus}</p>
            <SavedIn id={pokemon.id} />
          </div>
          <div className="hidden sm:block mt-1">
            <AddToListButton id={pokemon.id} variant="details" />
          </div>
        </div>
      </div>

      <SpriteGallery key={pokemon.id} pokemon={pokemon} female={femaleForm} />

      <hr className="border-gray-200 my-6" />

      {/* Tipos / Generación / Habitat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Type
          </h3>
          <div className="flex flex-wrap gap-2">
            {shown.types.map((t) => (
              <TypeBadge key={t.type.name} type={t.type.name} />
            ))}
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Generation
          </h3>
          <div className="text-gray-700 text-sm">
            <span className="font-bold">Gen {genLabel}</span>{" "}
            <span className="text-gray-400">— {regionLabel}</span>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Habitat
          </h3>
          <p className="text-gray-700 text-sm capitalize">{habitat}</p>
        </div>
      </div>
      <TypeMatchups types={shown.types.map((t) => t.type.name)} />
      <hr className="border-gray-200 my-6" />

      {/* Entrada de Pokédex */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
          Pokédex Entry
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">{flavor}</p>
        {data.isRegional && (
          <p className="text-xs text-gray-400 mt-2">
            Shared with the original form.
          </p>
        )}
      </div>

      <hr className="border-gray-200 my-6" />

      {/* Evolutions */}
      <EvoChain
        chain={data.evoChain}
        currentName={data.speciesName}
        currentForm={data.isRegional ? pokemon.name : null}
      />

      <hr className="border-gray-200 my-6" />

      {/* Selector de género, solo si hay datos distintos por género */}
      {hasGenders && (
        <div className="flex justify-center gap-2 mb-6">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              onClick={() => pickGender(g)}
              className={`min-h-[45px] sm:min-h-0 px-4 py-1.5 rounded-lg text-sm font-semibold border-2 transition cursor-pointer ${
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

      {/* Altura, peso y habilidades */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
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
        <div className="col-span-2 sm:col-span-1 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Abilities
          </h3>
          <div className="flex flex-col gap-1 items-start">
            {shown.abilities.map((a) => (
              <Link
                key={a.ability.name}
                to={`/abilities?open=${a.ability.name}`}
                className="min-h-[45px] sm:min-h-0 inline-flex items-center text-gray-700 text-sm capitalize hover:text-red-600 hover:underline transition"
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

      {/* Mega y Gigamax solo existen para la forma original */}
      {!data.isRegional && (
        <AltFormsAccordion species={species} baseStats={shown.stats} />
      )}
      <LearnedMovesPanel pokemon={shown} />
      <MoreInfoPanel pokemon={shown} species={species} />
    </div>
  );
}
