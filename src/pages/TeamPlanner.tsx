import { useState, type FormEvent } from "react";
import { GameSelect } from "../components/team/GameSelect";
import { Link } from "react-router-dom";
import { useTeams } from "../hooks/useTeams";
import { MAX_TEAMS, TEAM_SIZE, type Team } from "../context/TeamsContext";
import {
  GAMES,
  GAME_BY_ID,
  genLabel,
  spriteStyle,
  teamIconUrl,
  usesArtwork,
} from "../lib/games";
import { SpriteImg } from "../components/SpriteImg";

type SortKey = "oldest" | "newest" | "az" | "za" | "game";

const SORT_LABELS: Record<SortKey, string> = {
  oldest: "Oldest first",
  newest: "Newest first",
  az: "Name A–Z",
  za: "Name Z–A",
  game: "By game",
};

// Posición del juego en la lista, para ordenar de Red a Scarlet/Violet
const gameOrder = (id: string) => {
  const i = GAMES.findIndex((g) => g.id === id);
  return i < 0 ? GAMES.length : i;
};

const ghostBtn =
  "px-4 py-1.5 rounded-full border-[1.5px] border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:border-gray-400 transition cursor-pointer";
const cardBase = "border rounded-xl p-4 transition";

// Lo de adentro de la tarjeta: igual en modo normal y en modo selección
function CardBody({ team }: { team: Team }) {
  const g = GAME_BY_ID.get(team.game);
  const art = !!g && usesArtwork(g);
  return (
    <>
      <h3 className="font-bold text-gray-900 truncate pr-6">{team.name}</h3>
      <p className="text-xs text-gray-400 mt-0.5">
        {g ? `Pokémon ${g.label} · ${genLabel(g.gen)}` : "Unknown game"}
      </p>

      {/* Los 6 casilleros: ocupados o vacíos */}
      <div className="flex gap-1.5 mt-3">
        {Array.from({ length: TEAM_SIZE }, (_, i) => {
          const m = team.members[i];
          return m ? (
            <SpriteImg
              key={i}
              src={teamIconUrl(m.pokemonId, g)}
              alt=""
              className={`${art ? "w-9 h-9" : "w-10 h-10"} object-contain`}
              style={spriteStyle(!art)}
            />
          ) : (
            <span
              key={i}
              className="w-10 h-10 rounded-full border-2 border-dashed border-gray-200"
            />
          );
        })}
      </div>
    </>
  );
}

export function TeamPlanner() {
  const { teams, createTeam, deleteTeam, teamNameError } = useTeams();
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [sort, setSort] = useState<SortKey>("oldest");
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    const err = teamNameError(name) ?? (game ? null : "Choose a game.");
    if (err) {
      setError(err);
      return;
    }
    createTeam(name, game);
    setName("");
    // El juego queda elegido: es cómodo para crear varios del mismo
  }

  // El array ya viene en orden de creación: "newest" es darlo vuelta
  const visible =
    sort === "oldest"
      ? teams
      : sort === "newest"
        ? [...teams].reverse()
        : [...teams].sort((a, b) => {
            if (sort === "game")
              // Mismo juego: por nombre
              return (
                gameOrder(a.game) - gameOrder(b.game) ||
                a.name.localeCompare(b.name)
              );
            return sort === "az"
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          });

  const allSelected =
    teams.length > 0 && teams.every((t) => selected.includes(t.id));

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleAll() {
    setSelected(allSelected ? [] : teams.map((t) => t.id));
  }

  function stopSelecting() {
    setSelecting(false);
    setSelected([]);
  }

  function handleDeleteSelected() {
    const n = selected.length;
    if (!confirm(`Delete ${n} ${n === 1 ? "team" : "teams"}?`)) return;
    selected.forEach(deleteTeam);
    stopSelecting();
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Planner</h2>

      {/* Crear equipo: nombre + juego */}
      <form onSubmit={handleCreate} className="flex flex-wrap gap-2 mb-2">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="New team name..."
          maxLength={40}
          className="flex-1 min-w-48 px-4 py-2 border border-gray-300 rounded-full text-gray-700 text-sm focus:outline-none focus:border-red-400"
        />
        <GameSelect
          value={game}
          onChange={(g) => {
            setGame(g);
            setError(null);
          }}
        />

        <button
          type="submit"
          className="px-5 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition cursor-pointer"
        >
          Create
        </button>
      </form>

      {/* El error, o cuántos equipos hay */}
      <p
        className={`text-xs px-4 mb-6 ${error ? "text-red-500" : "text-gray-400"}`}
      >
        {error ?? `${teams.length} / ${MAX_TEAMS} teams`}
      </p>

      {/* Barra: orden y selección */}
      {teams.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="item-select"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>

          {selecting ? (
            <>
              <button onClick={toggleAll} className={ghostBtn}>
                {allSelected ? "Unselect all" : "Select all"}
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selected.length === 0}
                className="px-4 py-1.5 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Delete ({selected.length})
              </button>
              <button onClick={stopSelecting} className={ghostBtn}>
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setSelecting(true)} className={ghostBtn}>
              Select
            </button>
          )}
        </div>
      )}

      {teams.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          You don't have any teams yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((t) => {
            // Modo normal: la tarjeta es un link al equipo
            if (!selecting) {
              return (
                <Link
                  key={t.id}
                  to={`/team-planner/${t.id}`}
                  className={`${cardBase} bg-gray-50 border-gray-200 hover:border-red-300 hover:bg-white`}
                >
                  <CardBody team={t} />
                </Link>
              );
            }

            // Modo selección: click marca o desmarca
            const isSel = selected.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleSelect(t.id)}
                className={`${cardBase} relative text-left cursor-pointer ${
                  isSel
                    ? "bg-red-50 border-red-400"
                    : "bg-gray-50 border-gray-200 hover:border-red-300"
                }`}
              >
                <span
                  className={`absolute top-3 right-3 w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs font-bold ${
                    isSel
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {isSel && "✓"}
                </span>
                <CardBody team={t} />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
