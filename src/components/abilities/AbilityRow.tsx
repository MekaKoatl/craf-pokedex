import { Link } from "react-router-dom";
import { SpriteImg } from "../SpriteImg";
import { iconOrSprite } from "../../lib/sprites";
import { getRegionalDisplayName } from "../../lib/regional";
import { prettyName } from "../../lib/text";
import { genLabel } from "../../lib/items";
import {
  abilityShortEffect,
  abilityEffect,
  abilityFlavor,
  idFromUrl,
} from "../../lib/abilities";
import type { Ability } from "../../types/ability";

type Entry = Ability["pokemon"][number];

// "generation-iii" → 3, para la columna compacta
const GEN_NUM: Record<string, number> = {
  "generation-i": 1,
  "generation-ii": 2,
  "generation-iii": 3,
  "generation-iv": 4,
  "generation-v": 5,
  "generation-vi": 6,
  "generation-vii": 7,
  "generation-viii": 8,
  "generation-ix": 9,
};

function PokemonGrid({ entries }: { entries: Entry[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(68px,1fr))] gap-1 mt-2">
      {entries.map((e) => {
        const id = idFromUrl(e.pokemon.url);
        return (
          <Link
            key={e.pokemon.name}
            to={`/details/${id}`}
            className="flex flex-col items-center gap-0.5 p-1 rounded hover:bg-white transition"
          >
            <SpriteImg
              src={iconOrSprite(id)}
              alt=""
              className="w-12 h-12 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
            <span className="text-[0.6rem] text-gray-500 text-center leading-tight">
              {getRegionalDisplayName(e.pokemon.name)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function AbilityRow({
  ability,
  open,
  onToggle,
}: {
  ability: Ability;
  open: boolean;
  onToggle: () => void;
}) {
  const name = prettyName(ability.name);
  const short = abilityShortEffect(ability);

  if (!open) {
    return (
      <button className="ability-row" onClick={onToggle}>
        <span className="ability-cell ability-cell-name">{name}</span>
        <span className="ability-cell ability-cell-count">
          {ability.pokemon.length}
        </span>
        <span className="ability-cell ability-cell-desc">{short}</span>
        <span className="ability-cell ability-cell-gen">
          {GEN_NUM[ability.generation.name] ?? "—"}
        </span>
      </button>
    );
  }

  const normal = ability.pokemon.filter((p) => !p.is_hidden);
  const hidden = ability.pokemon.filter((p) => p.is_hidden);
  const flavor = abilityFlavor(ability);
  const effect = abilityEffect(ability);
  const gen = genLabel(ability.generation.name);

  return (
    <div className="ability-expanded">
      <button
        onClick={onToggle}
        title="Close"
        className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
      >
        ✕
      </button>

      <h3 className="text-2xl font-bold text-gray-900 leading-tight pr-6">
        {name}
      </h3>
      {gen && (
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mt-1">
          Introduced in {gen}
        </p>
      )}
      {short && <p className="text-gray-700 mt-2 leading-relaxed">{short}</p>}

      {flavor && (
        <blockquote className="mt-4 border-l-4 border-red-400 pl-3 text-sm italic text-gray-500">
          {flavor}
        </blockquote>
      )}

      {effect && (
        <div className="mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">
            Effect
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {effect}
          </p>
        </div>
      )}

      {normal.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400">
            Pokémon with {name} ({normal.length})
          </h4>
          <PokemonGrid entries={normal} />
        </div>
      )}

      {hidden.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400">
            As a hidden ability ({hidden.length})
          </h4>
          <PokemonGrid entries={hidden} />
        </div>
      )}
    </div>
  );
}