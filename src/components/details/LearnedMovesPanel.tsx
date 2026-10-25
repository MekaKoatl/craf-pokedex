import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMove, fetchInBatches } from "../../lib/api";
import { buildLearnset } from "../../lib/learnset";
import { prettyName } from "../../lib/text";
import { TypeBadge } from "../badges/TypeBadge";
import { LoadingSpinner } from "../LoadingSpinner";
import type { PokemonFull } from "../../types/pokemon";
import type { Move } from "../../types/move";

type Row = { name: string; level?: number };

function MoveTable({
  title,
  rows,
  moves,
  showLevel = false,
  empty,
}: {
  title: string;
  rows: Row[];
  moves: Record<string, Move>;
  showLevel?: boolean;
  empty: string;
}) {
  // Cada tarjeta guarda su propio estado
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left cursor-pointer"
      >
        <h4 className="text-sm font-bold text-gray-900">
          {title}{" "}
          <span className="text-gray-400 font-semibold">({rows.length})</span>
        </h4>
        <span className="text-gray-400 text-lg leading-none">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="mt-3">
          {rows.length === 0 ? (
            <p className="text-sm text-gray-400 italic">{empty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-400 uppercase tracking-wide border-b border-gray-200">
                    {showLevel && <th className="py-2 pr-2 text-right">Lv.</th>}
                    <th className="py-2 px-2">Move</th>
                    <th className="py-2 px-2">Type</th>
                    <th className="py-2 px-2">Cat.</th>
                    <th className="py-2 px-2 text-right">Power</th>
                    <th className="py-2 pl-2 text-right">Acc.</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const m = moves[r.name];
                    return (
                      // El índice va en la key porque un movimiento puede
                      // repetirse en level up con dos niveles distintos
                      <tr
                        key={`${r.name}-${i}`}
                        className="border-b border-gray-100"
                      >
                        {showLevel && (
                          <td className="py-1.5 pr-2 text-right text-gray-500">
                            {r.level}
                          </td>
                        )}
                        <td className="py-1.5 px-2 font-semibold text-gray-800 whitespace-nowrap">
                          {prettyName(r.name)}
                        </td>
                        <td className="py-1.5 px-2 [&_.type-badge]:inline-block [&_.type-badge]:w-20 [&_.type-badge]:text-center">
                          {m ? <TypeBadge type={m.type.name} /> : "—"}
                        </td>
                        <td className="py-1.5 px-2 [&_.move-cat]:inline-block [&_.move-cat]:w-20 [&_.move-cat]:text-center">
                          {m ? (
                            <span
                              className={`move-cat move-cat-${m.damage_class.name}`}
                            >
                              {m.damage_class.name}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-1.5 px-2 text-right text-gray-700">
                          {m?.power ?? "—"}
                        </td>
                        <td className="py-1.5 pl-2 text-right text-gray-700">
                          {m && m.accuracy !== null ? `${m.accuracy}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LearnedMovesPanel({ pokemon }: { pokemon: PokemonFull }) {
  const [open, setOpen] = useState(false);
  const learnset = useMemo(() => buildLearnset(pokemon), [pokemon]);

  // Nombres sin repetir de las cuatro secciones: esto es lo que se pide
  const names = useMemo(() => {
    if (!learnset) return [];
    return [
      ...new Set([
        ...learnset.levelUp.map((r) => r.name),
        ...learnset.evolution,
        ...learnset.machine,
        ...learnset.egg,
      ]),
    ];
  }, [learnset]);

  const { data: moves } = useQuery({
    queryKey: ["learned-moves", pokemon.id, learnset?.version],
    queryFn: async () => {
      const list = await fetchInBatches(names, getMove, 20);
      const map: Record<string, Move> = {};
      for (const m of list) if (m) map[m.name] = m;
      return map;
    },
    enabled: open && names.length > 0,
    staleTime: Infinity,
  });

  if (!learnset) return null;

  // Si no hay nada que pedir, no hay que esperar a nada
  const ready = names.length === 0 || !!moves;
  const map = moves ?? {};
  const toRows = (arr: string[]) => arr.map((name) => ({ name }));

  return (
    <div className="mb-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold border rounded-xl transition ${
          open
            ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
            : "bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
        }`}
      >
        {open ? "Hide Learned Moves −" : "Learned Moves +"}
      </button>

      {open && (
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">
            Pokémon {prettyName(learnset.version)}
          </p>

          {!ready ? (
            <LoadingSpinner text="Loading moves..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="flex flex-col gap-4">
                <MoveTable
                  title="Moves learnt by level up"
                  rows={learnset.levelUp}
                  moves={map}
                  showLevel
                  empty="Doesn't learn any moves by level up."
                />
                <MoveTable
                  title="Moves learnt on evolution"
                  rows={toRows(learnset.evolution)}
                  moves={map}
                  empty="Doesn't learn any moves on evolution."
                />
                <MoveTable
                  title="Egg moves"
                  rows={toRows(learnset.egg)}
                  moves={map}
                  empty="Doesn't learn any moves by breeding."
                />
              </div>
              <MoveTable
                title="Moves learnt by TM"
                rows={toRows(learnset.machine)}
                moves={map}
                empty="Isn't compatible with any TMs."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
