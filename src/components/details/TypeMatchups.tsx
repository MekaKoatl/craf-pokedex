import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTypeRelations } from "../../lib/api";
import { MOVE_TYPES } from "../../lib/moves";
import { TypeBadge } from "../badges/TypeBadge";

type Mode = "defense" | "offense";
type Item = [string, number];

function fmt(v: number) {
  if (v === 0.5) return "×½";
  if (v === 0.25) return "×¼";
  return `×${v}`;
}

// Separa un mapa tipo → multiplicador en fuertes, débiles y nulos
function split(map: Record<string, number>) {
  const entries = Object.entries(map);
  return {
    high: entries
      .filter(([, v]) => v > 1)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    low: entries
      .filter(([, v]) => v > 0 && v < 1)
      .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0])),
    zero: entries
      .filter(([, v]) => v === 0)
      .sort((a, b) => a[0].localeCompare(b[0])),
  };
}

function Group({ label, items }: { label: string; items: Item[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h4 className="text-sm font-bold text-gray-900 mb-2">{label}</h4>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400">None</p>
      ) : (
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {items.map(([t, v]) => (
            <span key={t} className="inline-flex items-center gap-1">
              <TypeBadge type={t} />
              <span className="text-xs font-semibold text-gray-600">
                {fmt(v)}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function TypeMatchups({ types }: { types: string[] }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("defense");

  const { data } = useQuery({
    queryKey: ["type-matchups", ...types],
    queryFn: async () => {
      const rels = await Promise.all(types.map(getTypeRelations));

      // Defensa: arranca en ×1 implícito y cada tipo del Pokémon multiplica
      const def: Record<string, number> = {};
      for (const r of rels) {
        for (const t of r.double_damage_from)
          def[t.name] = (def[t.name] ?? 1) * 2;
        for (const t of r.half_damage_from)
          def[t.name] = (def[t.name] ?? 1) * 0.5;
        for (const t of r.no_damage_from) def[t.name] = 0;
      }

      // Ofensa: contra cada rival vale el mejor de sus tipos
      const off: Record<string, number> = {};
      for (const target of MOVE_TYPES) {
        off[target] = Math.max(
          ...rels.map((r) => {
            if (r.double_damage_to.some((t) => t.name === target)) return 2;
            if (r.no_damage_to.some((t) => t.name === target)) return 0;
            if (r.half_damage_to.some((t) => t.name === target)) return 0.5;
            return 1;
          }),
        );
      }

      return { def: split(def), off: split(off) };
    },
    enabled: open,
    staleTime: Infinity,
  });

  const groups: { label: string; items: Item[] }[] = !data
    ? []
    : mode === "defense"
      ? [
          { label: "Weak to", items: data.def.high },
          { label: "Strong against", items: data.def.low },
          { label: "Immune to", items: data.def.zero },
        ]
      : [
          { label: "Super effective against", items: data.off.high },
          { label: "Not very effective against", items: data.off.low },
          { label: "No effect on", items: data.off.zero },
        ];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left cursor-pointer"
      >
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400">
          Type Matchups
        </h3>
        <span className="text-gray-400 text-lg leading-none">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="mt-4">
          {/* Conmutador: mismo estilo que el de género */}
          <div className="flex items-center gap-2 mb-2">
            {(["defense", "offense"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition cursor-pointer ${
                  mode === m
                    ? "bg-red-600 border-red-600 text-white"
                    : "border-gray-300 text-gray-500 hover:border-red-400"
                }`}
              >
                {m === "defense" ? "Defense" : "Offense"}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-4">
            {mode === "defense"
              ? "Damage this Pokémon takes from each type."
              : "Best damage this Pokémon's types deal to each type."}
          </p>

          {!data ? (
            <p className="text-xs text-gray-400">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {groups.map((g) => (
                <Group key={g.label} label={g.label} items={g.items} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}