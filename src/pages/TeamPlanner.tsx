import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTeams } from "../hooks/useTeams";
import { MAX_TEAMS, TEAM_SIZE } from "../context/TeamsContext";
import { GAMES, GAME_BY_ID, GENERATIONS, genLabel } from "../lib/games";
import { iconOrSprite } from "../lib/sprites";
import { SpriteImg } from "../components/SpriteImg";

export function TeamPlanner() {
  const { teams, createTeam, teamNameError } = useTeams();
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [error, setError] = useState<string | null>(null);

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
        <select
          value={game}
          onChange={(e) => {
            setGame(e.target.value);
            setError(null);
          }}
          className="item-select"
        >
          <option value="" disabled>
            Choose a game...
          </option>
          {/* Un grupo por generación */}
          {GENERATIONS.map((gen) => (
            <optgroup key={gen} label={genLabel(gen)}>
              {GAMES.filter((g) => g.gen === gen).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
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

      {teams.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          You don't have any teams yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((t) => {
            const g = GAME_BY_ID.get(t.game);
            return (
              <Link
                key={t.id}
                to={`/team-planner/${t.id}`}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:bg-white transition"
              >
                <h3 className="font-bold text-gray-900 truncate">{t.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {g ? `Pokémon ${g.label} · ${genLabel(g.gen)}` : "Unknown game"}
                </p>

                {/* Los 6 casilleros: ocupados o vacíos */}
                <div className="flex gap-1.5 mt-3">
                  {Array.from({ length: TEAM_SIZE }, (_, i) => {
                    const m = t.members[i];
                    return m ? (
                      <SpriteImg
                        key={i}
                        src={iconOrSprite(m.pokemonId)}
                        alt=""
                        className="w-10 h-10 object-contain"
                        style={{ imageRendering: "pixelated" }}
                      />
                    ) : (
                      <span
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-dashed border-gray-200"
                      />
                    );
                  })}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}