import { Link } from "react-router-dom";
import { SpriteImg } from "../SpriteImg";
import { iconOrSprite } from "../../lib/sprites";
import { getRegionalDisplayName } from "../../lib/regional";
import { prettyName, idFromUrl } from "../../lib/text";
import { genLabel } from "../../lib/items";
import { TypeBadge } from "../badges/TypeBadge";
import { moveShortEffect, moveEffect, moveFlavor } from "../../lib/moves";
import type { Move } from "../../types/move";

const LEARNED_CAP = 50;

export function MoveRow({
  move,
  open,
  onToggle,
}: {
  move: Move;
  open: boolean;
  onToggle: () => void;
}) {
  const name = prettyName(move.name);
  const type = move.type.name;

  if (!open) {
    return (
      <button className="move-row" onClick={onToggle}>
        {/* El fondo del nombre toma el color del tipo */}
        <span className={`move-cell move-cell-name type-${type}`}>{name}</span>
        <span className="move-cell">
          <TypeBadge type={type} />
        </span>
        <span className="move-cell">
          <span className={`move-cat move-cat-${move.damage_class.name}`}>
            {move.damage_class.name}
          </span>
        </span>
        <span className="move-cell move-cell-num">{move.power ?? "—"}</span>
        <span className="move-cell move-cell-num">
          {move.accuracy !== null ? `${move.accuracy}%` : "—"}
        </span>
        <span className="move-cell move-cell-num">{move.pp ?? "—"}</span>
        <span className="move-cell move-cell-effect">
          {moveShortEffect(move)}
        </span>
      </button>
    );
  }

  const flavor = moveFlavor(move);
  const effect = moveEffect(move);
  const short = moveShortEffect(move);
  const gen = genLabel(move.generation.name);

  // Solo se arman las celdas que tienen dato
  const cells: { label: string; value: string }[] = [
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

  const learners = move.learned_by_pokemon;
  const visible = learners.slice(0, LEARNED_CAP);
  const hidden = learners.length - visible.length;

  return (
    <div className="move-expanded">
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
      <div className="flex items-center gap-2 mt-2">
        <TypeBadge type={type} />
        <span className={`move-cat move-cat-${move.damage_class.name}`}>
          {move.damage_class.name}
        </span>
        {gen && (
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
            {gen}
          </span>
        )}
      </div>

      {short && <p className="text-gray-700 mt-3 leading-relaxed">{short}</p>}

      {flavor && (
        <blockquote className="mt-4 border-l-4 border-red-400 pl-3 text-sm italic text-gray-500">
          {flavor}
        </blockquote>
      )}

      {effect && effect !== short && (
        <div className="mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">
            Effect
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {effect}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        {cells.map((c) => (
          <div
            key={c.label}
            className="bg-white border border-gray-200 rounded-lg p-3"
          >
            <h4 className="text-[0.65rem] font-bold uppercase tracking-wide text-gray-400 mb-1">
              {c.label}
            </h4>
            <p className="text-xs text-gray-700">{c.value}</p>
          </div>
        ))}
      </div>

      {visible.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400">
            Learned by ({learners.length})
          </h4>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(68px,1fr))] gap-1 mt-2">
            {visible.map((p) => {
              const id = idFromUrl(p.url);
              return (
                <Link
                  key={p.name}
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
                    {getRegionalDisplayName(p.name)}
                  </span>
                </Link>
              );
            })}
          </div>
          {hidden > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              …and {hidden} more Pokémon not shown.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
