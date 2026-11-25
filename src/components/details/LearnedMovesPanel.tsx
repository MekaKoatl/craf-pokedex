import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMove, fetchInBatches } from "../../lib/api";
import { buildLearnset } from "../../lib/learnset";
import { prettyName } from "../../lib/text";
import { CategoryBadge } from "../badges/CategoryBadge";
import { LoadingSpinner } from "../LoadingSpinner";
import type { PokemonFull } from "../../types/pokemon";
import type { Move } from "../../types/move";

/** Movimiento de una tabla; `level` solo en la de nivel. */
type Row = { name: string; level?: number };

/**
 * Tarjeta desplegable con la lista de movimientos de un método de aprendizaje,
 * con el estilo de la página Moves (clases `move-*` y `learn-*` de `index.css`).
 */
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
  const [open, setOpen] = useState(true);

  // Columnas de la grilla: con o sin la de nivel
  const rowClass = showLevel ? "learn-row" : "learn-row no-lv";

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full min-h-[45px] sm:min-h-0 flex items-center justify-between text-left cursor-pointer"
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
            <div className="move-table learn-table">
              <div className={`move-head ${rowClass}`}>
                {showLevel && (
                  <span className="move-head-cell is-static">Lv.</span>
                )}
                <span className="move-head-cell is-static learn-head-name">
                  Move
                </span>
                <span className="move-head-cell is-static">Type</span>
                <span className="move-head-cell is-static">Cat.</span>
                <span className="move-head-cell is-static">Pow.</span>
                <span className="move-head-cell is-static">Acc.</span>
              </div>
              {rows.map((r, i) => {
                const m = moves[r.name];
                // Sin datos del movimiento, las celdas quedan sin color
                const type = m ? ` type-${m.type.name}` : "";
                return (
                  // La key incluye el índice: un movimiento puede aparecer
                  // dos veces por nivel con niveles distintos
                  <div
                    key={`${r.name}-${i}`}
                    className={`move-row ${rowClass}`}
                  >
                    {showLevel && (
                      <span className="move-cell move-cell-num learn-lv">
                        {r.level}
                      </span>
                    )}
                    <span className={`move-cell move-cell-name${type}`}>
                      {prettyName(r.name)}
                    </span>
                    <span className={`move-cell move-cell-type${type}`}>
                      {m ? prettyName(m.type.name) : "—"}
                    </span>
                    {/* En celular solo el ícono; el nombre, al pasar el mouse */}
                    <span
                      className="move-cell move-cell-cat"
                      title={m ? prettyName(m.damage_class.name) : undefined}
                    >
                      {m ? (
                        <CategoryBadge category={m.damage_class.name} />
                      ) : (
                        "—"
                      )}
                    </span>
                    <span className="move-cell move-cell-num">
                      {m?.power ?? "—"}
                    </span>
                    <span className="move-cell move-cell-num">
                      {m && m.accuracy !== null ? `${m.accuracy}%` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Movimientos que aprende un Pokémon en el juego más reciente donde aparece,
 * en cuatro tablas: por nivel, al evolucionar, por MT/MO y huevo.
 */
export function LearnedMovesPanel({ pokemon }: { pokemon: PokemonFull }) {
  const [open, setOpen] = useState(false);
  const learnset = useMemo(() => buildLearnset(pokemon), [pokemon]);

  // Movimientos sin repetir de las cuatro tablas, para pedir sus datos
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

  // Sin movimientos no hay nada que esperar
  const ready = names.length === 0 || !!moves;
  const map = moves ?? {};
  const toRows = (arr: string[]) => arr.map((name) => ({ name }));

  return (
    <div className="mb-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full min-h-[45px] sm:min-h-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold border rounded-xl transition ${
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
            <div className="flex flex-col gap-4">
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
