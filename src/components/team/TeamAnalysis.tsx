import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { getMove } from "../../lib/api";
import { useTeamForms } from "../../hooks/useTeamForms";
import {
  moveForGame,
  typesForGame,
  type MoveInGame,
} from "../../lib/teamRules";
import {
  abilityMultiplier,
  defenseMultiplier,
  effectiveness,
  typesForGen,
} from "../../lib/typeChart";
import type { Game } from "../../lib/games";
import { TypeBadge } from "../badges/TypeBadge";
import type { TeamMember } from "../../context/TeamsContext";

type Mode = "defense" | "offense";

// flex-none: el CSS global le da flex: 1 al badge y lo estiraba en columna
const badgeCol =
  "[&_.type-badge]:inline-block [&_.type-badge]:w-20 [&_.type-badge]:flex-none";

// Cuánto suma o resta cada multiplicador al total de defensa
function defenseScore(v: number): number {
  if (v >= 4) return -2;
  if (v > 1) return -1;
  if (v === 0 || v <= 0.25) return 2;
  if (v < 1) return 1;
  return 0;
}

// Tarjeta de cada tipo: roja si hay un problema
function cardClass(danger: boolean) {
  return `flex flex-col items-center gap-1 p-2 rounded-lg border ${badgeCol} ${
    danger ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
  }`;
}

function textClass(danger: boolean) {
  return `text-xs font-semibold ${danger ? "text-red-600" : "text-gray-600"}`;
}

// Solo existe mientras el análisis está abierto: recién ahí pide datos
function AnalysisBody({
  members,
  game,
}: {
  members: TeamMember[];
  game: Game;
}) {
  const [mode, setMode] = useState<Mode>("defense");

  const forms = useTeamForms(members);

  const moveNames = [
    ...new Set(members.flatMap((m) => m.moves.filter(Boolean))),
  ];
  const moveResults = useQueries({
    queries: moveNames.map((n) => ({
      queryKey: ["team-move", n],
      queryFn: () => getMove(n),
      staleTime: Infinity,
    })),
  });

  // La forma que pelea: la Mega si la tiene, si no la normal
  const pokes = forms.map((f) => f.mega ?? f.base);
  // La Mega tiene una sola habilidad fija; si no, la elegida
  const abilities = forms.map((f, i) =>
    f.mega ? (f.mega.abilities[0]?.ability.name ?? null) : members[i].ability,
  );
  if (pokes.some((p) => !p)) {
    return <p className="text-xs text-gray-400 mt-4">Loading analysis...</p>;
  }

  const gen = game.gen;
  const types = typesForGen(gen);
  const memberTypes = pokes.map((p) => (p ? typesForGame(p, gen) : []));

  // nombre → cómo era el movimiento en este juego
  const moveInfo: Record<string, MoveInGame> = {};
  for (const r of moveResults) {
    if (r.data) moveInfo[r.data.name] = moveForGame(r.data, game);
  }

  // ── Defensa: ×2 resta 1, ×4 resta 2; ×½ suma 1, ×¼ e inmunidad suman 2
  const defense = types.map((atk) => {
    // Tipos primero, después la habilidad elegida (si hay)
    const mults = memberTypes.map((ts, i) =>
      abilityMultiplier(
        atk,
        defenseMultiplier(atk, ts, gen),
        abilities[i],
        gen,
      ),
    );
    const weak = mults.filter((v) => v > 1).length;
    const resist = mults.filter((v) => v < 1).length;
    const total = mults.reduce((sum, v) => sum + defenseScore(v), 0);
    return { type: atk, weak, resist, total };
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
    type: def,
    // Cuántos miembros le pegan súper efectivo a este tipo
    count: attackTypes.filter((a) =>
      a.types.some((atk) => effectiveness(atk, def, gen) > 1),
    ).length,
  }));
  const usingFallback = attackTypes.filter((a) => a.fallback).length;

  return (
    <div className="mt-4">
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
          ? "Weaknesses subtract (×2 = −1, ×4 = −2). Resistances add (×½ = +1, ×¼ or immune = +2). Chosen abilities like Levitate count."
          : "How many team members hit each type super effectively."}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {mode === "defense"
          ? defense.map((d) => {
              const danger = d.total < 0;
              const total =
                d.total > 0
                  ? `+${d.total}`
                  : d.total < 0
                    ? `−${-d.total}`
                    : "0";
              return (
                <div key={d.type} className={cardClass(danger)}>
                  <TypeBadge type={d.type} />
                  <span className="text-xs text-gray-500">
                    {d.weak} weak · {d.resist} resist
                  </span>
                  <span className={textClass(danger)}>Total: {total}</span>
                </div>
              );
            })
          : offense.map((o) => {
              const danger = o.count === 0;
              return (
                <div key={o.type} className={cardClass(danger)}>
                  <TypeBadge type={o.type} />
                  <span className={textClass(danger)}>
                    {danger ? "Not covered" : `${o.count} super effective`}
                  </span>
                </div>
              );
            })}
      </div>

      {mode === "offense" && usingFallback > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          {usingFallback} {usingFallback === 1 ? "member has" : "members have"}{" "}
          no damaging moves yet, so their own types are used.
        </p>
      )}
    </div>
  );
}

export function TeamAnalysis({
  members,
  game,
}: {
  members: TeamMember[];
  game: Game;
}) {
  // Arranca cerrado
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left cursor-pointer"
      >
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400">
          Team Analysis
        </h3>
        <span className="text-gray-400 text-lg leading-none">
          {open ? "✕" : "+"}
        </span>
      </button>

      {open && <AnalysisBody members={members} game={game} />}
    </div>
  );
}
