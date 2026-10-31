import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTeams } from "../hooks/useTeams";
import { TEAM_SIZE } from "../context/TeamsContext";
import { POKEMON_DATA } from "../data/pokemon-data";
import { GAME_POKEMON } from "../data/pokemon-games";
import { GAME_BY_ID, genLabel } from "../lib/games";
import { getRegionalDisplayName } from "../lib/regional";
import { iconOrSprite, pokemonSpriteUrl } from "../lib/sprites";
import { compareDex, dexNumber } from "../lib/dexOrder";
import { SpriteImg } from "../components/SpriteImg";
import { TypeBadge } from "../components/badges/TypeBadge";
import { MemberPanel } from "../components/team/MemberPanel";
import { TeamAnalysis } from "../components/team/TeamAnalysis";

// Cuántos resultados muestra el buscador
const MAX_RESULTS = 8;

const ENTRY_BY_ID = new Map(POKEMON_DATA.map((e) => [e.id, e]));

export function TeamEditor() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const {
    teams,
    renameTeam,
    deleteTeam,
    teamNameError,
    addMember,
    removeMember,
    updateMember,
  } = useTeams();
  const team = teams.find((t) => t.id === teamId);
  const game = team ? GAME_BY_ID.get(team.game) : undefined;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  // Qué casillero está abierto en el panel (null = ninguno)
  const [selected, setSelected] = useState<number | null>(null);

  if (!team || !game) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-500 mb-4">This team doesn't exist.</p>
        <Link to="/team-planner" className="text-sm text-red-500 font-semibold">
          ← Back to teams
        </Link>
      </section>
    );
  }

  const full = team.members.length >= TEAM_SIZE;

  // Buscador: solo los Pokémon que existen en el juego del equipo
  const available = new Set(GAME_POKEMON[game.group] ?? []);
  const q = search.trim().toLowerCase();
  const matches = q
    ? POKEMON_DATA.filter(
        (e) =>
          available.has(e.id) &&
          (e.name.includes(q) ||
            getRegionalDisplayName(e.name).toLowerCase().includes(q)),
      )
        .sort((a, b) => compareDex(a.id, b.id))
        .slice(0, MAX_RESULTS)
    : [];

  const startEdit = () => {
    setDraft(team.name);
    setRenameError(null);
    setEditing(true);
  };

  const handleRename = (e: FormEvent) => {
    e.preventDefault();
    const err = teamNameError(draft, team.id);
    if (err) {
      setRenameError(err);
      return;
    }
    renameTeam(team.id, draft);
    setEditing(false);
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${team.name}"?`)) return;
    deleteTeam(team.id);
    navigate("/team-planner", { replace: true });
  };

  const handleAdd = (pokemonId: number) => {
    addMember(team.id, pokemonId);
    setSearch("");
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <Link
        to="/team-planner"
        className="text-sm text-gray-400 hover:text-gray-600 transition"
      >
        ← Teams
      </Link>

      {/* Título, o el formulario para renombrar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
        {editing ? (
          <form onSubmit={handleRename} className="flex flex-1 gap-2">
            <input
              autoFocus
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setRenameError(null);
              }}
              onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
              maxLength={40}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xl font-bold text-gray-900 focus:outline-none focus:border-red-400"
            />
            <button
              type="submit"
              className="px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-2 text-sm font-semibold text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900">{team.name}</h2>
            <div className="flex gap-4 text-sm font-semibold">
              <button
                onClick={startEdit}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                Rename
              </button>
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 transition cursor-pointer"
              >
                Delete team
              </button>
            </div>
          </>
        )}
      </div>
      {editing && renameError && (
        <p className="text-xs text-red-500 mt-1">{renameError}</p>
      )}
      <p className="text-sm text-gray-400 mt-1 mb-6">
        Pokémon {game.label} · {genLabel(game.gen)}
      </p>

      {/* Buscador: se desactiva con el equipo lleno */}
      <div className="relative mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setSearch("")}
          disabled={full}
          placeholder={
            full
              ? "The team is full. Remove a Pokémon to add another."
              : `Add a Pokémon from ${game.label}...`
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-full text-gray-700 text-sm focus:outline-none focus:border-red-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        {q && !full && (
          <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {matches.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400">
                No Pokémon found in {game.label}.
              </li>
            ) : (
              matches.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => handleAdd(e.id)}
                    className="w-full flex items-center gap-3 px-3 py-1 text-left hover:bg-gray-50 transition cursor-pointer"
                  >
                    <SpriteImg
                      src={iconOrSprite(e.id)}
                      alt=""
                      className="w-10 h-10 object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <span className="w-12 text-xs text-gray-400">
                      #{dexNumber(e.id)}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-gray-800">
                      {getRegionalDisplayName(e.name)}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">
                      + Add
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Los 6 casilleros */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: TEAM_SIZE }, (_, i) => {
          const m = team.members[i];
          if (!m) {
            return (
              <div
                key={i}
                className="flex items-center justify-center h-48 rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-300"
              >
                Empty slot
              </div>
            );
          }
          const entry = ENTRY_BY_ID.get(m.pokemonId);
          return (
            <div
              key={i}
              onClick={() => setSelected(i === selected ? null : i)}
              className={`flex flex-col items-center gap-1 h-48 p-3 rounded-xl border cursor-pointer transition ${
                i === selected
                  ? "border-red-400 bg-white"
                  : "border-gray-200 bg-gray-50 hover:border-red-300"
              }`}
            >
              <SpriteImg
                src={pokemonSpriteUrl(m.pokemonId)}
                alt=""
                className="w-24 h-24 object-contain"
                style={{ imageRendering: "pixelated" }}
              />
              <Link
                to={`/details/${m.pokemonId}`}
                className="text-sm font-bold text-gray-900 hover:text-red-600 text-center leading-tight"
              >
                {entry ? getRegionalDisplayName(entry.name) : `#${m.pokemonId}`}
              </Link>
              <div className="flex gap-0.5">
                {entry?.types.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </div>
              <button
                onClick={(e) => {
                  // Que el click no abra el panel de este casillero
                  e.stopPropagation();
                  removeMember(team.id, i);
                  setSelected(null);
                }}
                className="mt-auto text-xs font-semibold text-gray-400 hover:text-red-500 transition cursor-pointer"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
      {selected !== null && team.members[selected] && (
        <MemberPanel
          key={selected}
          member={team.members[selected]}
          name={getRegionalDisplayName(
            ENTRY_BY_ID.get(team.members[selected].pokemonId)?.name ?? "",
          )}
          game={game}
          onChange={(changes) => updateMember(team.id, selected, changes)}
          onClose={() => setSelected(null)}
        />
      )}
      {team.members.length > 0 && (
        <TeamAnalysis members={team.members} game={game} />
      )}
    </section>
  );
}
