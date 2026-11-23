import { useState, type FormEvent } from "react";
import { GameSelect } from "../components/team/GameSelect";
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
import { GameTag } from "../components/team/GameTag";
import { ImportPanel } from "../components/team/ImportPanel";
import {
  COLLECTION_SORT_LABELS,
  sortCollection,
  type CollectionSort,
} from "../lib/collections";
import { useSelection } from "../hooks/useSelection";
import { CollectionToolbar } from "../components/collection/CollectionToolbar";
import { SelectableCard } from "../components/collection/SelectableCard";

/** Órdenes de la página: los comunes más "por juego". */
type SortKey = CollectionSort | "game";

const SORT_LABELS: Record<SortKey, string> = {
  ...COLLECTION_SORT_LABELS,
  game: "By game",
};

/** Posición cronológica del juego, para ordenar por juego. */
const gameOrder = (id: string) => {
  const i = GAMES.findIndex((g) => g.id === id);
  return i < 0 ? GAMES.length : i;
};

/** Contenido de la tarjeta de un equipo: nombre, juego y los 6 casilleros. */
function CardBody({ team }: { team: Team }) {
  const g = GAME_BY_ID.get(team.game);
  const art = !!g && usesArtwork(g);
  return (
    <>
      <h3 className="font-bold text-gray-900 truncate pr-6">{team.name}</h3>
      <div className="flex items-center gap-2 mt-1">
        {g ? (
          <>
            <GameTag game={g} />
            <span className="text-xs text-gray-400">{genLabel(g.gen)}</span>
          </>
        ) : (
          <span className="text-xs text-gray-400">Unknown game</span>
        )}
      </div>

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

/**
 * Página Team Planner (`/team-planner`): crear equipos por juego, importarlos
 * desde Showdown y ver, ordenar, seleccionar y borrar los existentes.
 */
export function TeamPlanner() {
  const { teams, createTeam, deleteTeam, teamNameError } = useTeams();
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [sort, setSort] = useState<SortKey>("oldest");

  const [importing, setImporting] = useState(false);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    const err = teamNameError(name) ?? (game ? null : "Choose a game.");
    if (err) {
      setError(err);
      return;
    }
    createTeam(name, game);
    setName("");
    // El juego queda seleccionado para crear otro del mismo
  }

  // Por juego (de Red a Scarlet/Violet); dentro del mismo juego, por nombre
  const visible = sortCollection(
    teams,
    sort,
    (a, b) =>
      gameOrder(a.game) - gameOrder(b.game) || a.name.localeCompare(b.name),
  );
  const selection = useSelection(visible.map((t) => t.id));

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Planner</h2>

      {/* Crear equipo */}
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
          className="flex-1 min-w-48 px-4 h-[45px] sm:h-auto py-2 border border-gray-300 rounded-full text-gray-700 text-base sm:text-sm focus:outline-none focus:border-red-400"
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
          className="btn-primary min-h-[45px] sm:min-h-0 px-5 py-2 rounded-full text-sm"
        >
          Create
        </button>

        <button
          type="button"
          onClick={() => setImporting((v) => !v)}
          className="btn-ghost"
        >
          Import
        </button>
      </form>

      {/* Error o cantidad de equipos */}
      <p
        className={`text-xs px-4 mb-6 ${error ? "text-red-500" : "text-gray-400"}`}
      >
        {error ?? `${teams.length} / ${MAX_TEAMS} teams`}
      </p>

      {/* Importar desde Showdown */}
      {importing && <ImportPanel onClose={() => setImporting(false)} />}

      {teams.length > 0 && (
        <CollectionToolbar
          sort={sort}
          sortLabels={SORT_LABELS}
          onSort={setSort}
          selection={selection}
          onDelete={() =>
            selection.deleteSelected(deleteTeam, ["team", "teams"])
          }
        />
      )}

      {teams.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          You don't have any teams yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((t) => (
            <SelectableCard
              key={t.id}
              to={`/team-planner/${t.id}`}
              selecting={selection.selecting}
              selected={selection.selected.includes(t.id)}
              onToggle={() => selection.toggle(t.id)}
            >
              <CardBody team={t} />
            </SelectableCard>
          ))}
        </div>
      )}
    </section>
  );
}
