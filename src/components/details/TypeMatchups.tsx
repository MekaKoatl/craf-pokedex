import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTypeRelations } from "../../lib/api";
import { TypeBadge } from "../badges/TypeBadge";

function fmt(v: number) {
  if (v === 0.5) return "×½";
  if (v === 0.25) return "×¼";
  return `×${v}`;
}

function Group({
  label,
  items,
}: {
  label: string;
  items: [string, number][];
}) {
  return (
    <div>
      <h4 className="text-[0.65rem] font-bold uppercase tracking-wide text-gray-400 mb-1.5">
        {label}
      </h4>
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

  const { data: chart } = useQuery({
    queryKey: ["type-matchups", ...types],
    queryFn: async () => {
      const rels = await Promise.all(types.map(getTypeRelations));
      // Arranca en ×1 implícito; cada tipo del Pokémon multiplica
      const mult: Record<string, number> = {};
      for (const r of rels) {
        for (const t of r.double_damage_from)
          mult[t.name] = (mult[t.name] ?? 1) * 2;
        for (const t of r.half_damage_from)
          mult[t.name] = (mult[t.name] ?? 1) * 0.5;
        for (const t of r.no_damage_from) mult[t.name] = 0;
      }
      return mult;
    },
    enabled: open,
    staleTime: Infinity,
  });

  // Los que quedan en ×1 (se anularon) no van en ninguna lista
  const entries = Object.entries(chart ?? {});
  const weak = entries
    .filter(([, v]) => v > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const strong = entries
    .filter(([, v]) => v > 0 && v < 1)
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
  const immune = entries
    .filter(([, v]) => v === 0)
    .sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-semibold text-gray-400 hover:text-red-600 transition cursor-pointer"
      >
        {open ? "Matchups −" : "Matchups +"}
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col gap-3">
          {!chart ? (
            <p className="text-xs text-gray-400">Loading...</p>
          ) : (
            <>
              <Group label="Weak to" items={weak} />
              <Group label="Strong against" items={strong} />
              {immune.length > 0 && (
                <Group label="Immune to" items={immune} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}