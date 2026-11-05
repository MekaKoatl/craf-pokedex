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

// Nombres y colores como en las barras de Details
const ROWS = [
  { label: "HP", color: "bg-red-500" },
  { label: "ATK", color: "bg-orange-500" },
  { label: "DEF", color: "bg-yellow-500" },
  { label: "SP.ATK", color: "bg-blue-500" },
  { label: "SP.DEF", color: "bg-green-500" },
  { label: "SPD", color: "bg-purple-500" },
];

// nombre · base · barra · total · IV · EV
const rowGrid =
  "grid grid-cols-[56px_36px_1fr_40px_64px_64px] sm:grid-cols-[72px_44px_1fr_48px_72px_72px] items-center gap-2 sm:gap-3";

const numClass =
  "w-full px-2 py-1 border border-gray-300 rounded-md text-xs text-right text-gray-700 bg-white focus:outline-none focus:border-red-400";

// Número entero dentro de un rango; lo vacío cuenta como el mínimo
const clamp = (v: string, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.floor(Number(v)) || min));

// Copia la lista cambiando solo una posición
function setAt(arr: StatTuple, i: number, v: number): StatTuple {
  const next = [...arr] as StatTuple;
  next[i] = v;
  return next;
}

// El stat más alto posible a ese nivel (base 255, IV 31, 252 EVs,
// naturaleza a favor): es el 100% de la barra
function maxStat(i: number, level: number): number {
  const core = Math.floor(((2 * 255 + 31 + 63) * level) / 100);
  return i === 0 ? core + level + 10 : Math.floor((core + 5) * 1.1);
}

export function StatsEditor({
  base,
  member,
  onChange,
}: {
  base: StatTuple | null; // null mientras cargan los datos
  member: TeamMember;
  onChange: (changes: Partial<TeamMember>) => void;
}) {
  // Arranca cerrada
  const [open, setOpen] = useState(false);

  const level = member.level ?? DEFAULT_LEVEL;
  const ivs = member.ivs ?? DEFAULT_IVS;
  const evs = member.evs ?? EMPTY_EVS;

  const evTotal = evs.reduce((a, b) => a + b, 0);
  const over = evTotal > MAX_EV_TOTAL;
  const stats = base ? calcStats(base, ivs, evs, level, member.nature) : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      {/* Encabezado: abre y cierra */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
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
                className={`${numClass} w-16`}
              />
            </label>
            {EV_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange({ evs: p.evs })}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500 transition cursor-pointer"
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

          {/* Títulos de las columnas */}
          <div
            className={`${rowGrid} text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1`}
          >
            <span />
            <span className="text-right">Base</span>
            <span />
            <span className="text-right">Total</span>
            <span className="text-center">IV</span>
            <span className="text-center">EV</span>
          </div>

          {/* Una fila por stat */}
          <div className="flex flex-col">
            {ROWS.map((row, i) => {
              // Rojo si la naturaleza lo sube, azul si lo baja
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
                  className={`${rowGrid} py-1.5 border-t border-gray-100`}
                >
                  <span className={`text-sm font-bold ${color}`}>
                    {row.label}
                    {mult > 1 ? " +" : mult < 1 ? " −" : ""}
                  </span>
                  <span className="text-xs text-right text-gray-500">
                    {base?.[i] ?? "—"}
                  </span>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
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
                    className={numClass}
                  />
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
                    className={numClass}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
