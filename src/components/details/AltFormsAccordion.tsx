import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getPokemonFull } from "../../lib/api";
import { cdnSprite } from "../../lib/sprites";
import { prettyName } from "../../lib/text";
import { TypeBadge } from "../badges/TypeBadge";
import { SpriteImg } from "../SpriteImg";
import { LoadingSpinner } from "../LoadingSpinner";
import { StatBars } from "./StatBar";
import { SpriteGallery } from "./SpriteGallery";
import type { Species, PokemonFull } from "../../types/pokemon";

// La ficha y el panel usan la misma clave: se pide una sola vez
function useAltForm(name: string) {
  return useQuery({
    queryKey: ["alt-form", name],
    queryFn: () => getPokemonFull(name),
    staleTime: Infinity,
  });
}

// "charizard-mega-x" → "Mega Charizard X"
// "venusaur-gmax"    → "Gigantamax Venusaur"
function formInfo(name: string) {
  const isMega = name.includes("-mega");
  const [base, rest = ""] = name.split(isMega ? "-mega" : "-gmax");
  const suffix = rest.replace(/^-/, "").toUpperCase();
  const tag = isMega ? "Mega" : "Gigantamax";
  return {
    isMega,
    tag,
    label: `${tag} ${prettyName(base)}${suffix ? ` ${suffix}` : ""}`,
  };
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
      {children}
    </h4>
  );
}

function FormTile({
  name,
  active,
  onClick,
}: {
  name: string;
  active: boolean;
  onClick: () => void;
}) {
  const { data: p } = useAltForm(name);
  const info = formInfo(name);

  return (
    <button
      onClick={onClick}
      className={`evo-node flex-none w-32 cursor-pointer${
        active ? " evo-node-current" : ""
      }`}
    >
      <span
        className={`form-alt-tag ${
          info.isMega ? "form-alt-tag-mega" : "form-alt-tag-gmax"
        }`}
      >
        {info.tag}
      </span>
      {/* Sin datos todavía no se dibuja el img: un src vacío pide la página actual */}
      {p ? (
        <SpriteImg
          className="evo-node-img"
          src={cdnSprite(p.sprites.other?.["official-artwork"]?.front_default)}
          alt={info.label}
        />
      ) : (
        <div className="evo-node-img" />
      )}
      <span className="evo-node-name">{info.label}</span>
    </button>
  );
}

function FormPanel({
  name,
  baseStats,
  onClose,
}: {
  name: string;
  baseStats: PokemonFull["stats"];
  onClose: () => void;
}) {
  const { data: p } = useAltForm(name);
  const info = formInfo(name);

  return (
    <div className="relative mt-3 bg-gray-50 border border-gray-200 rounded-xl p-6">
      <button
        onClick={onClose}
        title="Close"
        className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
      >
        ✕
      </button>
      <h3 className="text-xl font-bold text-gray-900 mb-4 pr-6">
        {info.label}
      </h3>

      {!p ? (
        <LoadingSpinner text="Loading..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SpriteGallery pokemon={p} />

          <div className="flex flex-col gap-5">
            <div>
              <Label>Type</Label>
              <div className="flex flex-wrap gap-2">
                {p.types.map((t) => (
                  <TypeBadge key={t.type.name} type={t.type.name} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Height</Label>
                <p className="text-gray-700 text-sm">
                  {(p.height / 10).toFixed(1)} m
                </p>
              </div>
              <div>
                <Label>Weight</Label>
                <p className="text-gray-700 text-sm">
                  {(p.weight / 10).toFixed(1)} kg
                </p>
              </div>
            </div>

            <div>
              <Label>Abilities</Label>
              <div className="flex flex-col gap-1 items-start">
                {p.abilities.map((a) => (
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

            <div>
              <Label>Base Stats</Label>
              <StatBars stats={p.stats} base={baseStats} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AltFormsAccordion({
  species,
  baseStats,
}: {
  species: Species;
  baseStats: PokemonFull["stats"];
}) {
  // Va antes del return temprano: los hooks siempre en el mismo orden
  const [selected, setSelected] = useState<string | null>(null);

  const forms = species.varieties
    .map((v) => v.pokemon.name)
    .filter((n) => n.includes("-mega") || n.includes("-gmax"));

  if (forms.length === 0) return null;

  // Si se navega a otro Pokémon sin desmontar Details, la selección
  // vieja no pertenece a esta especie: se ignora
  const current = selected && forms.includes(selected) ? selected : null;

  return (
    <div className="mb-8">
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">
        Alternative Forms
      </h3>

      <div className="sprite-strip flex gap-3 overflow-x-auto pb-2">
        {forms.map((n) => (
          <FormTile
            key={n}
            name={n}
            active={current === n}
            onClick={() => setSelected(current === n ? null : n)}
          />
        ))}
      </div>

      {current ? (
        // La key remonta el panel (y su galería) al cambiar de forma
        <FormPanel
          key={current}
          name={current}
          baseStats={baseStats}
          onClose={() => setSelected(null)}
        />
      ) : (
        <p className="text-sm text-gray-400 mt-2">
          Select a form to see its details.
        </p>
      )}
    </div>
  );
}