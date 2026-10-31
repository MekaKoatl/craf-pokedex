import { useQueries, useQuery } from "@tanstack/react-query";
import { getMove, getPokemonFull } from "../../lib/api";
import {
  abilitiesForGame,
  moveForGame,
  movesForGame,
  NATURES,
  natureLabel,
  itemLabel,
  itemsForGame,
  ITEM_GROUPS,
  type MoveInGame,
} from "../../lib/teamRules";
import { gameFeatures, type Game } from "../../lib/games";
import { prettyName } from "../../lib/text";
import { pokemonSpriteUrl } from "../../lib/sprites";
import { SpriteImg } from "../SpriteImg";
import { TypeBadge } from "../badges/TypeBadge";
import type { TeamMember } from "../../context/TeamsContext";

const MOVE_SLOTS = [0, 1, 2, 3];

const labelClass =
  "block text-xs font-bold uppercase tracking-wide text-gray-400 mb-1";
const selectClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-red-400";

export function MemberPanel({
  member,
  name,
  game,
  onChange,
  onClose,
}: {
  member: TeamMember;
  name: string;
  game: Game;
  onChange: (changes: Partial<TeamMember>) => void;
  onClose: () => void;
}) {
  const features = gameFeatures(game);

  const { data: pokemon } = useQuery({
    queryKey: ["pokemon-full", member.pokemonId],
    queryFn: () => getPokemonFull(member.pokemonId),
    staleTime: Infinity,
  });
  const abilities = pokemon ? abilitiesForGame(pokemon, game.gen) : [];
  const learnable = pokemon ? movesForGame(pokemon, game.group) : [];
  const items = features.items ? itemsForGame(game) : {};

  // Los datos de cada movimiento elegido, uno por consulta
  const chosen = member.moves.filter(Boolean);
  const moveResults = useQueries({
    queries: chosen.map((n) => ({
      queryKey: ["team-move", n],
      queryFn: () => getMove(n),
      staleTime: Infinity,
    })),
  });
  // nombre → cómo era en este juego
  const moveInfo: Record<string, MoveInGame> = {};
  for (const r of moveResults) {
    if (r.data) moveInfo[r.data.name] = moveForGame(r.data, game);
  }

  function setMove(slot: number, moveName: string) {
    // Siempre 4 posiciones; las vacías quedan como ""
    const next = MOVE_SLOTS.map((j) =>
      j === slot ? moveName : (member.moves[j] ?? ""),
    );
    onChange({ moves: next });
  }

  return (
    <div className="relative mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
      <button
        onClick={onClose}
        title="Close"
        className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
      >
        ✕
      </button>

      <div className="flex items-center gap-3 mb-5">
        <SpriteImg
          src={pokemonSpriteUrl(member.pokemonId)}
          alt=""
          className="w-16 h-16 object-contain"
          style={{ imageRendering: "pixelated" }}
        />
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
      </div>

      {/* Habilidad y naturaleza, solo si existen en el juego */}
      {(features.abilities || features.natures || features.items) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {features.abilities && (
            <div>
              <label className={labelClass}>Ability</label>
              <select
                value={member.ability ?? ""}
                onChange={(e) => onChange({ ability: e.target.value || null })}
                disabled={!pokemon}
                className={selectClass}
              >
                <option value="">{pokemon ? "— None —" : "Loading..."}</option>
                {abilities.map((a) => (
                  <option key={a.name} value={a.name}>
                    {prettyName(a.name)}
                    {a.hidden ? " (hidden)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {features.natures && (
            <div>
              <label className={labelClass}>Nature</label>
              <select
                value={member.nature ?? ""}
                onChange={(e) => onChange({ nature: e.target.value || null })}
                className={selectClass}
              >
                <option value="">— None —</option>
                {NATURES.map((n) => (
                  <option key={n.name} value={n.name}>
                    {natureLabel(n)}
                  </option>
                ))}
              </select>
            </div>
          )}
                    {features.items && (
            <div>
              <label className={labelClass}>Item</label>
              <select
                value={member.item ?? ""}
                onChange={(e) => onChange({ item: e.target.value || null })}
                className={selectClass}
              >
                <option value="">— None —</option>
                {ITEM_GROUPS.filter((g) => items[g.key]).map((g) => (
                  <optgroup key={g.key} label={g.label}>
                    {items[g.key].map((n) => (
                      <option key={n} value={n}>
                        {itemLabel(n)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Los 4 movimientos */}
      <label className={labelClass}>Moves</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MOVE_SLOTS.map((slot) => {
          const current = member.moves[slot] ?? "";
          // No se ofrece lo que ya está en otro casillero
          const taken = new Set(member.moves.filter((_, j) => j !== slot));
          const info = current ? moveInfo[current] : undefined;

          return (
            <div
              key={slot}
              className="bg-white border border-gray-200 rounded-lg p-2"
            >
              <select
                value={current}
                onChange={(e) => setMove(slot, e.target.value)}
                disabled={!pokemon}
                className={selectClass}
              >
                <option value="">
                  {pokemon ? `— Move ${slot + 1} —` : "Loading..."}
                </option>
                {learnable
                  .filter((n) => !taken.has(n))
                  .map((n) => (
                    <option key={n} value={n}>
                      {prettyName(n)}
                    </option>
                  ))}
              </select>

              {info && (
                <div className="flex flex-wrap items-center gap-2 mt-2 px-1 text-xs text-gray-500 [&_.type-badge]:inline-block [&_.type-badge]:w-20">
                  <TypeBadge type={info.type} />
                  <span className={`move-cat move-cat-${info.category}`}>
                    {info.category}
                  </span>
                  <span>Pow {info.power ?? "—"}</span>
                  <span>
                    Acc {info.accuracy !== null ? `${info.accuracy}%` : "—"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
