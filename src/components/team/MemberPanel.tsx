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
  megaStoneLabel,
  megaStonesFor,
  ITEM_GROUPS,
  baseStats,
  megaNameFor,
  type MoveInGame,
} from "../../lib/teamRules";
import {
  gameFeatures,
  spriteStyle,
  teamSpriteUrl,
  usesArtwork,
  type Game,
} from "../../lib/games";
import { prettyName } from "../../lib/text";
import { SpriteImg } from "../SpriteImg";
import { TypeBadge } from "../badges/TypeBadge";
import { SearchSelect } from "../SearchSelect";
import { POKEMON_DATA } from "../../data/pokemon-data";
import { StatsEditor } from "./StatsEditor";
import { StatBars } from "../details/StatBar";
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
  // Si tiene su Megapiedra, los stats salen de la Mega
  const megaName = pokemon
    ? megaNameFor(pokemon.species.name, member.item)
    : null;
  const { data: mega } = useQuery({
    queryKey: ["pokemon-full", megaName ?? ""],
    queryFn: () => getPokemonFull(megaName as string),
    enabled: !!megaName,
    retry: false,
    staleTime: Infinity,
  });
  const statSource = (megaName && mega) || pokemon;

  // Megapiedras propias: solo especies con Mega, en juegos con Megas
  const entry = POKEMON_DATA.find((e) => e.id === member.pokemonId);
  const stones = entry?.forms.includes("M")
    ? megaStonesFor(entry.name, game)
    : [];
  // Cuál está equipada ahora (null = ninguna, o un objeto que no es Megapiedra)
  const activeStone = stones.find((s) => s === member.item) ?? null;

  function setMega(stone: string | null) {
    if (stone) onChange({ item: stone });
    // "No Mega" solo saca el objeto si era su Megapiedra
    else if (activeStone) onChange({ item: null });
  }

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

      <div className="flex flex-wrap items-center gap-3 mb-5 pr-8">
        <SpriteImg
          src={teamSpriteUrl(member.pokemonId, game)}
          alt=""
          className="w-16 h-16 object-contain"
          style={spriteStyle(!usesArtwork(game))}
        />
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>

        {/* Toggle de Mega: mismo estilo que Defense / Offense */}
        {stones.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            {[null, ...stones].map((s) => (
              <button
                key={s ?? "off"}
                onClick={() => setMega(s)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition cursor-pointer ${
                  activeStone === s
                    ? "bg-red-600 border-red-600 text-white"
                    : "border-gray-300 text-gray-500 hover:border-red-400"
                }`}
              >
                {s ? megaStoneLabel(s) : "No Mega"}
              </button>
            ))}
          </div>
        )}
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
              <SearchSelect
                value={member.item}
                groups={ITEM_GROUPS.filter((g) => items[g.key]).map((g) => ({
                  label: g.label,
                  options: items[g.key].map((n) => ({
                    value: n,
                    label: itemLabel(n),
                  })),
                }))}
                onChange={(v) => onChange({ item: v })}
                placeholder="Search an item..."
              />
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
      {/* Stats: EVs/IVs desde Gen III; antes, solo los base */}
      <div className="mt-6">
        {game.gen >= 3 ? (
          <StatsEditor
            base={statSource ? baseStats(statSource) : null}
            member={member}
            onChange={onChange}
          />
        ) : (
          <>
            <span className="block text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
              Base stats
            </span>
            {statSource && <StatBars stats={statSource.stats} />}
          </>
        )}
      </div>
    </div>
  );
}
