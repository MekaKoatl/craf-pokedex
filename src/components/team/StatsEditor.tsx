import { useState } from "react";
import {
  calcStats,
  DEFAULT_IVS,
  DEFAULT_LEVEL,
  EMPTY_EVS,
  EV_PRESETS,
  MAX_EV,
  MAX_EV_TOTAL,
  MAX_IV,
  natureMultiplier,
  type StatTuple,
} from "../../lib/teamRules";
import type { TeamMember } from "../../context/TeamsContext";

/** Nombre y color de cada stat, iguales a las barras de Details. */
const ROWS = [
  { label: "HP", color: "bg-red-500" },
  { label: "ATK", color: "bg-orange-500" },
  { label: "DEF", color: "bg-yellow-500" },
  { label: "SP.ATK", color: "bg-blue-500" },
  { label: "SP.DEF", color: "bg-green-500" },
  { label: "SPD", color: "bg-purple-500" },
];

/**
 * Grilla de cada fila de stat.
 * - Celular, dos líneas: nombre | barra (2 columnas) | total, y base | IV | EV.
 * - Escritorio, una línea: nombre · base · barra · total · IV · EV.
 */
const rowGrid =
  "grid grid-cols-[56px_1fr_1fr_40px] sm:grid-cols-[72px_44px_1fr_48px_72px_72px] items-center gap-x-2 gap-y-1.5 sm:gap-3";

/** Campo numérico. En celular: 45px de alto y letra de 16px (con menos, iOS hace zoom). */
const numClass =
  "h-[45px] sm:h-auto px-2 py-1 border border-gray-300 rounded-md text-base sm:text-xs text-right text-gray-700 bg-white focus:outline-none focus:border-red-400";

/** Pasa el elemento a la segunda línea en celular; en escritorio queda en su lugar. */
const secondLine = "order-1 sm:order-none";

/** Convierte un texto en entero dentro de [min, max]; vacío o inválido cuenta como `min`. */
const clamp = (v: string, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.floor(Number(v)) || min));

/** Copia de la tupla con la posición `i` cambiada. */
function setAt(arr: StatTuple, i: number, v: number): StatTuple {
  const next = [...arr] as StatTuple;
  next[i] = v;
  return next;
}

/** Stat máximo posible a ese nivel (base 255, IV 31, 252 EVs, naturaleza a favor); es el 100% de la barra. */
function maxStat(i: number, level: number): number {
  const core = Math.floor(((2 * 255 + 31 + 63) * level) / 100);
  return i === 0 ? core + level + 10 : Math.floor((core + 5) * 1.1);
}

/**
 * Editor desplegable de nivel, IVs y EVs de un miembro, con los stats finales
 * calculados y repartos de EVs rápidos. Marca en rojo el total si supera
 * `MAX_EV_TOTAL`.
 */
export function StatsEditor({
  base,
  member,
  onChange,
}: {
  /** Stats base del Pokémon; null mientras cargan. */
  base: StatTuple | null;
  member: TeamMember;
  onChange: (changes: Partial<TeamMember>) => void;
}) {
  const [open, setOpen] = useState(false);

  const level = member.level ?? DEFAULT_LEVEL;
  const ivs = member.ivs ?? DEFAULT_IVS;
  const evs = member.evs ?? EMPTY_EVS;

  const evTotal = evs.reduce((a, b) => a + b, 0);
  const over = evTotal > MAX_EV_TOTAL;
  const stats = base ? calcStats(base, ivs, evs, level, member.nature) : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      {/* Encabezado desplegable */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full min-h-[45px] sm:min-h-0 flex items-center justify-between gap-3 text-left cursor-pointer"
      >
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
          Stats
        </span>
        <span className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold ${over ? "text-red-600" : "text-gray-400"}`}
          >
            Lv {level} · EVs {evTotal} / {MAX_EV_TOTAL}
          </span>
          <span className="text-gray-400 text-lg leading-none">
            {open ? "−" : "+"}
          </span>
        </span>
      </button>

      {open && (
        <div className="mt-4">
          {/* Nivel y repartos rápidos */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <label className="flex items-center gap-2 text-xs text-gray-500 mr-2">
              Level
              <input
                type="number"
                min={1}
                max={100}
                value={level}
                onChange={(e) =>
                  onChange({ level: clamp(e.target.value, 1, 100) })
                }
                className={`${numClass} w-20 sm:w-16`}
              />
            </label>
            {EV_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange({ evs: p.evs })}
                className="min-h-[45px] sm:min-h-0 px-3 sm:px-2.5 py-1 rounded-lg text-xs sm:text-[11px] font-semibold border border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500 transition cursor-pointer"
              >
                {p.label}
              </button>
            ))}
            {over && (
              <span className="text-xs font-semibold text-red-600">
                Too many EVs
              </span>
            )}
          </div>

          {/* Títulos de columnas, solo en escritorio */}
          <div
            className={`${rowGrid} hidden sm:grid text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1`}
          >
            <span />
            <span className="text-right">Base</span>
            <span />
            <span className="text-right">Total</span>
            <span className="text-center">IV</span>
            <span className="text-center">EV</span>
          </div>

          <div className="flex flex-col">
            {ROWS.map((row, i) => {
              // Rojo si la naturaleza lo sube; azul si lo baja
              const mult = natureMultiplier(member.nature, i);
              const color =
                mult > 1
                  ? "text-red-600"
                  : mult < 1
                    ? "text-blue-600"
                    : "text-gray-500";
              const total = stats?.[i];
              const width = total
                ? Math.min(100, (total / maxStat(i, level)) * 100)
                : 0;

              return (
                <div
                  key={row.label}
                  className={`${rowGrid} py-2.5 sm:py-1.5 border-t border-gray-100`}
                >
                  <span className={`text-sm font-bold ${color}`}>
                    {row.label}
                    {mult > 1 ? " +" : mult < 1 ? " −" : ""}
                  </span>

                  <span
                    className={`${secondLine} text-xs text-gray-500 sm:text-right`}
                  >
                    <span className="sm:hidden text-gray-400">Base </span>
                    {base?.[i] ?? "—"}
                  </span>

                  {/* En celular la barra ocupa dos columnas */}
                  <div className="col-span-2 sm:col-span-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${row.color}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>

                  <span
                    className={`text-sm font-bold text-right ${mult === 1 ? "text-gray-900" : color}`}
                  >
                    {total ?? "—"}
                  </span>

                  <label className={`${secondLine} flex items-center gap-1.5`}>
                    <span className="sm:hidden text-[11px] font-bold text-gray-400">
                      IV
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={MAX_IV}
                      value={ivs[i]}
                      onChange={(e) =>
                        onChange({
                          ivs: setAt(ivs, i, clamp(e.target.value, 0, MAX_IV)),
                        })
                      }
                      className={`${numClass} flex-1 min-w-0 w-full`}
                    />
                  </label>

                  <label className={`${secondLine} flex items-center gap-1.5`}>
                    <span className="sm:hidden text-[11px] font-bold text-gray-400">
                      EV
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={MAX_EV}
                      step={4}
                      value={evs[i]}
                      onChange={(e) =>
                        onChange({
                          evs: setAt(evs, i, clamp(e.target.value, 0, MAX_EV)),
                        })
                      }
                      className={`${numClass} flex-1 min-w-0 w-full`}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
