import { useRevealOnOpen } from "../../hooks/useRevealOnOpen";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { prettyName, idFromUrl } from "../../lib/text";
import { genLabel } from "../../lib/items";
import { TypeBadge } from "../badges/TypeBadge";
import { CategoryBadge } from "../badges/CategoryBadge";
import { moveShortEffect, moveEffect, moveFlavor } from "../../lib/moves";
import type { Move } from "../../types/move";
import {
  CloseButton,
  FlavorAndEffect,
  InfoCells,
  type InfoCell,
} from "../lists/RowParts";
import { PokemonLink } from "../lists/PokemonLink";

const LEARNED_ROWS = 2;

export function MoveRow({
  move,
  open,
  onToggle,
}: {
  move: Move;
  open: boolean;
  onToggle: () => void;
}) {
  const ref = useRevealOnOpen<HTMLDivElement>(open);
  const name = prettyName(move.name);
  const type = move.type.name;
  // Cuántas columnas tiene "Learned by" (las mismas que sm: y lg: del grid)
  const isSm = useMediaQuery("(min-width: 640px)");
  const isLg = useMediaQuery("(min-width: 1024px)");

  if (!open) {
    return (
      <button className="move-row" onClick={onToggle}>
        {/* Nombre y tipo llevan de fondo el color del tipo */}
        <span className={`move-cell move-cell-name type-${type}`}>{name}</span>
        <span className={`move-cell move-cell-type type-${type}`}>
          {prettyName(type)}
        </span>
        <span className="move-cell move-cell-cat">
          <CategoryBadge category={move.damage_class.name} />
        </span>
        <span className="move-cell move-cell-num move-cell-power">
          {move.power ?? "—"}
        </span>
        <span className="move-cell move-cell-num move-cell-acc">
          {move.accuracy !== null ? `${move.accuracy}%` : "—"}
        </span>
        <span className="move-cell move-cell-num move-cell-pp">
          {move.pp ?? "—"}
        </span>
        <span className="move-cell move-cell-effect">
          {moveShortEffect(move)}
        </span>
        <span className="item-plus" aria-hidden="true">
          +
        </span>
      </button>
    );
  }

  const flavor = moveFlavor(move);
  const effect = moveEffect(move);
  const short = moveShortEffect(move);
  const gen = genLabel(move.generation.name);

  // Solo se arman las celdas que tienen dato
  const cells: InfoCell[] = [
    { label: "Power", value: move.power !== null ? String(move.power) : "—" },
    {
      label: "Accuracy",
      value: move.accuracy !== null ? `${move.accuracy}%` : "—",
    },
    { label: "PP", value: move.pp !== null ? String(move.pp) : "—" },
    { label: "Priority", value: String(move.priority) },
    // { label: "Category", value: prettyName(move.damage_class.name) },
    { label: "Target", value: prettyName(move.target.name) },
  ];

  const meta = move.meta;
  if (meta) {
    if (meta.ailment.name !== "none")
      cells.push({
        label: "Ailment",
        value: `${prettyName(meta.ailment.name)}${
          meta.ailment_chance ? ` (${meta.ailment_chance}%)` : ""
        }`,
      });
    if (meta.crit_rate)
      cells.push({ label: "Crit rate", value: `+${meta.crit_rate}` });
    // drain negativo es retroceso, positivo es absorción
    if (meta.drain)
      cells.push({
        label: meta.drain > 0 ? "Drain" : "Recoil",
        value: `${Math.abs(meta.drain)}%`,
      });
    if (meta.healing)
      cells.push({ label: "Healing", value: `${meta.healing}%` });
    if (meta.flinch_chance)
      cells.push({ label: "Flinch", value: `${meta.flinch_chance}%` });
    if (meta.min_hits && meta.max_hits)
      cells.push({
        label: "Hits",
        value:
          meta.min_hits === meta.max_hits
            ? String(meta.min_hits)
            : `${meta.min_hits}–${meta.max_hits}`,
      });
    if (meta.min_turns && meta.max_turns)
      cells.push({
        label: "Turns",
        value:
          meta.min_turns === meta.max_turns
            ? String(meta.min_turns)
            : `${meta.min_turns}–${meta.max_turns}`,
      });
  }

  if (move.stat_changes.length)
    cells.push({
      label: "Stat changes",
      value: move.stat_changes
        .map(
          (s) =>
            `${prettyName(s.stat.name)} ${s.change > 0 ? `+${s.change}` : s.change}`,
        )
        .join(", "),
    });

  const learners = move.learned_by_pokemon.filter(
    (p) => !p.name.endsWith("-gmax"),
  );
  // Hasta 2 filas; si sobran, el último lugar es para el "…and X more"
  const cols = isLg ? 12 : isSm ? 8 : 4;
  const max = cols * LEARNED_ROWS;
  const visible = learners.length > max ? learners.slice(0, max - 1) : learners;
  const hidden = learners.length - visible.length;
  return (
    <div ref={ref} className="move-expanded">
      <CloseButton onClick={onToggle} />

      <h3 className="text-2xl font-bold text-gray-900 leading-tight pr-8">
        {name}
      </h3>
      <div className="flex items-center gap-2 mt-2">
        <TypeBadge type={type} />
        <CategoryBadge category={move.damage_class.name} />
        {gen && (
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
            {gen}
          </span>
        )}
      </div>

      {short && <p className="text-gray-700 mt-3 leading-relaxed">{short}</p>}

      {/* El efecto largo solo si dice algo más que el corto */}
      <FlavorAndEffect
        flavor={flavor}
        effect={effect !== short ? effect : undefined}
      />

      <InfoCells cells={cells} />

      {visible.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400">
            Learned by ({learners.length})
          </h4>
          {/* Columnas fijas para poder contar cuántos entran en 2 filas */}
          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-1 mt-2">
            {visible.map((p) => (
              <PokemonLink key={p.name} id={idFromUrl(p.url)} name={p.name} />
            ))}
            {/* El último lugar de la segunda fila */}
            {hidden > 0 && (
              <div className="flex items-center justify-center p-1 text-center text-[0.65rem] leading-tight text-gray-400">
                …and {hidden} more Pokémon not shown.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
