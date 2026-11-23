import { useRevealOnOpen } from "../../hooks/useRevealOnOpen";
import { prettyName } from "../../lib/text";
import { genLabel } from "../../lib/items";
import {
  abilityShortEffect,
  abilityEffect,
  abilityFlavor,
  idFromUrl,
} from "../../lib/abilities";
import type { Ability } from "../../types/ability";
import { CloseButton, FlavorAndEffect } from "../lists/RowParts";
import { PokemonLink } from "../lists/PokemonLink";
type Entry = Ability["pokemon"][number];

/** Número de generación para la columna Gen: "generation-iii" → 3. */
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

/** Grilla de Pokémon que tienen la habilidad. */
function PokemonGrid({ entries }: { entries: Entry[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(68px,1fr))] gap-1 mt-2">
      {entries.map((e) => (
        <PokemonLink
          key={e.pokemon.name}
          id={idFromUrl(e.pokemon.url)}
          name={e.pokemon.name}
        />
      ))}
    </div>
  );
}

/**
 * Fila de la lista de habilidades. Cerrada muestra nombre, cantidad de
 * Pokémon, descripción corta y generación; abierta, una tarjeta con los
 * textos completos y los Pokémon que la tienen.
 */
export function AbilityRow({
  ability,
  open,
  onToggle,
}: {
  ability: Ability;
  open: boolean;
  onToggle: () => void;
}) {
  const ref = useRevealOnOpen<HTMLDivElement>(open);
  const name = prettyName(ability.name);
  const short = abilityShortEffect(ability);

  // Se excluyen las formas Gigamax y Mega, que repiten al Pokémon base.
  // El patrón "-mega" seguido de "-" o del final cubre mega, mega-x y mega-y,
  // pero no Meganium ni Yanmega (sin guion antes de "mega").
  const entries = ability.pokemon.filter(
    (p) =>
      !p.pokemon.name.endsWith("-gmax") && !/-mega(-|$)/.test(p.pokemon.name),
  );
  if (!open) {
    return (
      <button className="ability-row" onClick={onToggle}>
        <span className="ability-cell ability-cell-name">{name}</span>
        <span className="ability-cell ability-cell-count">
          {entries.length}
        </span>
        <span className="ability-cell ability-cell-desc">{short}</span>
        <span className="ability-cell ability-cell-gen">
          {GEN_NUM[ability.generation.name] ?? "—"}
        </span>
        <span className="item-plus" aria-hidden="true">
          +
        </span>
      </button>
    );
  }

  const normal = entries.filter((p) => !p.is_hidden);
  const hidden = entries.filter((p) => p.is_hidden);
  const flavor = abilityFlavor(ability);
  const effect = abilityEffect(ability);
  const gen = genLabel(ability.generation.name);

  return (
    <div ref={ref} className="ability-expanded">
      <CloseButton onClick={onToggle} />

      <h3 className="text-2xl font-bold text-gray-900 leading-tight pr-8">
        {" "}
        {name}
      </h3>
      {gen && (
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mt-1">
          Introduced in {gen}
        </p>
      )}
      {short && <p className="text-gray-700 mt-2 leading-relaxed">{short}</p>}

      <FlavorAndEffect flavor={flavor} effect={effect} />

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
