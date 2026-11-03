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
  STAT_NAMES,
  type StatTuple,
} from "../../lib/teamRules";
import type { TeamMember } from "../../context/TeamsContext";

const labelClass =
  "block text-xs font-bold uppercase tracking-wide text-gray-400";
const numClass =
  "w-16 px-2 py-1 border border-gray-300 rounded-md text-xs text-right text-gray-700 bg-white focus:outline-none focus:border-red-400";

// Número entero dentro de un rango; lo vacío cuenta como el mínimo
const clamp = (v: string, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.floor(Number(v)) || min));

// Copia la lista cambiando solo una posición
function setAt(arr: StatTuple, i: number, v: number): StatTuple {
  const next = [...arr] as StatTuple;
  next[i] = v;
  return next;
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
  const level = member.level ?? DEFAULT_LEVEL;
  const ivs = member.ivs ?? DEFAULT_IVS;
  const evs = member.evs ?? EMPTY_EVS;

  const evTotal = evs.reduce((a, b) => a + b, 0);
  const over = evTotal > MAX_EV_TOTAL;
  const stats = base ? calcStats(base, ivs, evs, level, member.nature) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <span className={labelClass}>Stats</span>
        <label className="flex items-center gap-2 text-xs text-gray-500">
          Level
          <input
            type="number"
            min={1}
            max={100}
            value={level}
            onChange={(e) => onChange({ level: clamp(e.target.value, 1, 100) })}
            className={numClass}
          />
        </label>
        <span
          className={`text-xs font-semibold ${over ? "text-red-600" : "text-gray-500"}`}
        >
          EVs {evTotal} / {MAX_EV_TOTAL}
          {over && " — too many"}
        </span>
      </div>

      {/* Repartos rápidos */}
      <div className="flex flex-wrap gap-2 mb-3">
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
      </div>

      <table className="w-full max-w-md text-xs">
        <thead>
          <tr className="text-gray-400 uppercase tracking-wide text-left">
            <th className="py-1 pr-2">Stat</th>
            <th className="py-1 px-2 text-right">Base</th>
            <th className="py-1 px-2 text-right">IV</th>
            <th className="py-1 px-2 text-right">EV</th>
            <th className="py-1 pl-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {STAT_NAMES.map((name, i) => {
            // Rojo si la naturaleza lo sube, azul si lo baja
            const mult = natureMultiplier(member.nature, i);
            const color =
              mult > 1
                ? "text-red-600"
                : mult < 1
                  ? "text-blue-600"
                  : "text-gray-700";
            return (
              <tr key={name} className="border-t border-gray-200">
                <td className={`py-1 pr-2 font-semibold ${color}`}>
                  {name}
                  {mult > 1 ? " +" : mult < 1 ? " −" : ""}
                </td>
                <td className="py-1 px-2 text-right text-gray-500">
                  {base?.[i] ?? "—"}
                </td>
                <td className="py-1 px-2 text-right">
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
                </td>
                <td className="py-1 px-2 text-right">
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
                </td>
                <td className={`py-1 pl-2 text-right font-bold ${color}`}>
                  {stats?.[i] ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}