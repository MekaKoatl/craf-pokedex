import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { getMove, getPokemonFull } from "../../lib/api";
import {
  moveForGame,
  typesForGame,
  type MoveInGame,
} from "../../lib/teamRules";
import {
  defenseMultiplier,
  effectiveness,
  typesForGen,
} from "../../lib/typeChart";
import type { Game } from "../../lib/games";
import { iconOrSprite } from "../../lib/sprites";
import { SpriteImg } from "../SpriteImg";
import { TypeBadge } from "../badges/TypeBadge";
import type { TeamMember } from "../../context/TeamsContext";

type Mode = "defense" | "offense";

function fmt(v: number) {
  if (v === 0.5) return "×½";
  if (v === 0.25) return "×¼";
  return `×${v}`;
}

// Color de cada celda según el multiplicador
function cellClass(v: number) {
  if (v === 0) return "bg-gray-800 text-white";
  if (v >= 4) return "bg-red-500 text-white";
  if (v >= 2) return "bg-red-100 text-red-700";
  if (v <= 0.25) return "bg-green-300 text-green-900";
  if (v < 1) return "bg-green-100 text-green-700";
  return "";
}

const badgeCol = "[&_.type-badge]:inline-block [&_.type-badge]:w-20";

export function TeamAnalysis({
  members,
  game,
}: {
  members: TeamMember[];
  game: Game;
}) {
  const [mode, setMode] = useState<Mode>("defense");

  const pokeResults = useQueries({
    queries: members.map((m) => ({
      queryKey: ["pokemon-full", m.pokemonId],
      queryFn: () => getPokemonFull(m.pokemonId),
      staleTime: Infinity,
    })),
  });

  const moveNames = [...new Set(members.flatMap((m) => m.moves.filter(Boolean)))];
  const moveResults = useQueries({
    queries: moveNames.map((n) => ({
      queryKey: ["team-move", n],
      queryFn: () => getMove(n),
      staleTime: Infinity,
    })),
  });

  const pokes = pokeResults.map((r) => r.data);
  if (pokes.some((p) => !p)) {
    return <p className="text-xs text-gray-400 mt-6">Loading analysis...</p>;
  }

  const gen = game.gen;
  const types = typesForGen(gen);
  const memberTypes = pokes.map((p) => (p ? typesForGame(p, gen) : []));

  // nombre → cómo era el movimiento en este juego
  const moveInfo: Record<string, MoveInGame> = {};
  for (const r of moveResults) {
    if (r.data) moveInfo[r.data.name] = moveForGame(r.data, game);
  }

  // ── Defensa: cada tipo atacante contra cada miembro
  const defenseRows = types.map((atk) => {
    const cells = memberTypes.map((ts) => defenseMultiplier(atk, ts, gen));
    return {
      atk,
      cells,
      weak: cells.filter((v) => v > 1).length,
      resist: cells.filter((v) => v < 1).length,
    };
  });

  // ── Ofensa: con qué tipos ataca cada miembro
  const attackTypes = members.map((m, i) => {
    const fromMoves = m.moves
      .map((n) => moveInfo[n])
      .filter((info) => info && info.category !== "status")
      .map((info) => info.type);
    // Sin movimientos de daño elegidos, cuentan sus propios tipos
    return fromMoves.length
      ? { types: [...new Set(fromMoves)], fallback: false }
      : { types: memberTypes[i], fallback: true };
  });

  const offense = types.map((def) => ({
    def,
    // Cuántos miembros le pegan súper efectivo a este tipo
    count: attackTypes.filter((a) =>
      a.types.some((atk) => effectiveness(atk, def, gen) > 1),
    ).length,
  }));
  const usingFallback = members.filter((_, i) => attackTypes[i].fallback).length;

  return (
    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">
        Team Analysis
      </h3>

      {/* Conmutador: mismo estilo que en Type Matchups */}
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
          ? "Damage each team member takes from each type."
          : "How many team members hit each type super effectively."}
      </p>

      {mode === "defense" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 uppercase tracking-wide">
                <th className="py-1 pr-2 text-left">Type</th>
                {members.map((m, i) => (
                  <th key={i} className="py-1 px-1">
                    <SpriteImg
                      src={iconOrSprite(m.pokemonId)}
                      alt=""
                      className="w-8 h-8 mx-auto object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </th>
                ))}
                <th className="py-1 px-2">Weak</th>
                <th className="py-1 pl-2">Resist</th>
              </tr>
            </thead>
            <tbody>
              {defenseRows.map((row) => (
                <tr
                  key={row.atk}
                  className={`border-t border-gray-200 ${row.weak >= 3 ? "bg-red-50" : ""}`}
                >
                  <td className={`py-1 pr-2 ${badgeCol}`}>
                    <TypeBadge type={row.atk} />
                  </td>
                  {row.cells.map((v, i) => (
                    <td key={i} className="py-1 px-1 text-center">
                      {v !== 1 && (
                        <span
                          className={`inline-block w-9 rounded font-semibold ${cellClass(v)}`}
                        >
                          {fmt(v)}
                        </span>
                      )}
                    </td>
                  ))}
                  <td
                    className={`py-1 px-2 text-center font-bold ${
                      row.weak >= 3 ? "text-red-600" : "text-gray-600"
                    }`}
                  >
                    {row.weak}
                  </td>
                  <td className="py-1 pl-2 text-center font-bold text-gray-600">
                    {row.resist}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {offense.map((o) => (
              <div
                key={o.def}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border ${badgeCol} ${
                  o.count === 0
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <TypeBadge type={o.def} />
                <span
                  className={`text-xs font-semibold ${
                    o.count === 0 ? "text-red-600" : "text-gray-600"
                  }`}
                >
                  {o.count === 0 ? "Not covered" : `${o.count} super effective`}
                </span>
              </div>
            ))}
          </div>
          {usingFallback > 0 && (
            <p className="text-xs text-gray-400 mt-3">
              {usingFallback} {usingFallback === 1 ? "member has" : "members have"}{" "}
              no damaging moves yet, so their own types are used.
            </p>
          )}
        </>
      )}
    </div>
  );
}