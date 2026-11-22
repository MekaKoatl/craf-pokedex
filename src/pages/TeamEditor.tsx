import { useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTeams } from "../hooks/useTeams";
import { TEAM_SIZE } from "../context/TeamsContext";
import { POKEMON_DATA } from "../data/pokemon-data";
import {
  GAME_BY_ID,
  genLabel,
  spriteStyle,
  teamSpriteUrl,
  usesArtwork,
} from "../lib/games";
import { getPokemonFull } from "../lib/api";
import { getRegionalDisplayName } from "../lib/regional";
import { cdnSprite } from "../lib/sprites";
import { megaLabel } from "../lib/teamRules";
import { transferMembers } from "../lib/teamTransfer";
import { useTeamForms } from "../hooks/useTeamForms";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { SpriteImg } from "../components/SpriteImg";
import { TypeBadge } from "../components/badges/TypeBadge";
import { MemberPanel } from "../components/team/MemberPanel";
import { TeamAnalysis } from "../components/team/TeamAnalysis";
import { GameSelect } from "../components/team/GameSelect";
import { ExportPanel } from "../components/team/ExportPanel";
import { PokemonBox } from "../components/team/PokemonBox";
import { GameTag } from "../components/team/GameTag";
import { RenameForm } from "../components/collection/RenameForm";

const ENTRY_BY_ID = new Map(POKEMON_DATA.map((e) => [e.id, e]));

const linkBtn =
  "min-h-[45px] sm:min-h-0 text-gray-400 hover:text-gray-600 transition cursor-pointer";

export function TeamEditor() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const {
    teams,
    createTeam,
    renameTeam,
    deleteTeam,
    teamNameError,
    addMember,
    removeMember,
    moveMember,
    updateMember,
  } = useTeams();
  const team = teams.find((t) => t.id === teamId);
  const game = team ? GAME_BY_ID.get(team.game) : undefined;

  const [editing, setEditing] = useState(false);
  // Qué casillero está abierto en el panel (null = ninguno)
  const [selected, setSelected] = useState<number | null>(null);

  // Duplicar
  const [duplicating, setDuplicating] = useState(false);
  const [dupName, setDupName] = useState("");
  const [dupGame, setDupGame] = useState("");
  const [dupError, setDupError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  // Arrastrar: qué casillero se está moviendo y sobre cuál está
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  // Para enfocar el buscador desde un casillero vacío
  const searchRef = useRef<HTMLInputElement>(null);

  // Aviso de lo que se quitó al duplicar (llega por el estado de la navegación)
  const notes = (location.state as { notes?: string[] } | null)?.notes ?? [];
  const [notesHidden, setNotesHidden] = useState(false);

  // Va antes del return temprano: los hooks siempre en el mismo orden
  const forms = useTeamForms(team?.members ?? []);

  // Arrastrar solo con mouse: en el celular agarraba el dedo y no dejaba bajar.
  // Es un hook para que se actualice si cambia el modo (celular ↔ compu)
  const canDrag = useMediaQuery("(pointer: fine)");

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

  // Juegos de Switch: arte oficial en lugar de sprites pixel
  const art = usesArtwork(game);

  const startEdit = () => {
    setDuplicating(false);
    setEditing(true);
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${team.name}"?`)) return;
    deleteTeam(team.id);
    navigate("/team-planner", { replace: true });
  };

  const startDuplicate = () => {
    setDupName(`${team.name} (copy)`);
    setDupGame(team.game);
    setDupError(null);
    setEditing(false);
    setDuplicating(true);
  };

  const handleDuplicate = async (e: FormEvent) => {
    e.preventDefault();
    const err = teamNameError(dupName) ?? (dupGame ? null : "Choose a game.");
    if (err) {
      setDupError(err);
      return;
    }
    const target = GAME_BY_ID.get(dupGame);
    if (!target) return;

    setBusy(true);
    try {
      const result = await transferMembers(team.members, target, (id) =>
        // Del caché si ya está; si no, lo pide
        queryClient.fetchQuery({
          queryKey: ["pokemon-full", id],
          queryFn: () => getPokemonFull(id),
          staleTime: Infinity,
        }),
      );
      const newId = createTeam(dupName, dupGame, result.members);
      if (!newId) return;
      setDuplicating(false);
      setSelected(null);
      setNotesHidden(false);
      navigate(`/team-planner/${newId}`, { state: { notes: result.notes } });
    } catch {
      setDupError("Couldn't load the Pokémon data. Try again.");
    } finally {
      // finally corre siempre, haya salido bien o mal
      setBusy(false);
    }
  };

  const resetDrag = () => {
    setDragFrom(null);
    setDragOver(null);
  };

  // Mueve un casillero de lugar. El panel abierto sigue a su Pokémon:
  // se hace el mismo movimiento sobre las posiciones para saber dónde quedó
  const move = (from: number, to: number) => {
    const order = team.members.map((_, i) => i);
    const [moved] = order.splice(from, 1);
    order.splice(Math.min(to, order.length), 0, moved);
    moveMember(team.id, from, to);
    if (selected !== null) setSelected(order.indexOf(selected));
  };

  const handleDrop = (to: number) => {
    if (dragFrom !== null && dragFrom !== to) move(dragFrom, to);
    resetDrag();
  };

  const focusSearch = () => {
    searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    searchRef.current?.focus({ preventScroll: true });
  };

  // Dejar soltar sobre este casillero (el navegador no lo permite por defecto)
  const allowDrop = (i: number) => (e: React.DragEvent) => {
    if (dragFrom === null) return;
    e.preventDefault();
    setDragOver(i);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <Link
        to="/team-planner"
        className="inline-flex items-center min-h-[45px] sm:min-h-0 text-sm text-gray-400 hover:text-gray-600 transition"
      >
        ← Teams
      </Link>
      {/* Título, o el formulario para renombrar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
        {editing ? (
          <RenameForm
            initial={team.name}
            validate={(n) => teamNameError(n, team.id)}
            onSave={(n) => {
              renameTeam(team.id, n);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900">{team.name}</h2>
            <div className="min-h-[45px] sm:min-h-0 flex gap-4 text-sm font-semibold">
              <button onClick={startEdit} className={linkBtn}>
                Rename
              </button>
              <button onClick={startDuplicate} className={linkBtn}>
                Duplicate
              </button>
              {team.members.length > 0 && (
                <button
                  onClick={() => setExporting((v) => !v)}
                  className={linkBtn}
                >
                  Export
                </button>
              )}
              <button
                onClick={handleDelete}
                className="min-h-[45px] sm:min-h-0 text-gray-400 hover:text-red-500 transition cursor-pointer"
              >
                Delete team
              </button>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 mt-1 mb-6">
        <GameTag game={game} />
        <span className="text-sm text-gray-400">{genLabel(game.gen)}</span>
      </div>
      {/* Formulario para duplicar */}
      {duplicating && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <form onSubmit={handleDuplicate} className="flex flex-wrap gap-2">
            <input
              autoFocus
              value={dupName}
              onChange={(e) => {
                setDupName(e.target.value);
                setDupError(null);
              }}
              maxLength={40}
              className="flex-1 min-w-48 px-4 h-[45px] sm:h-auto py-2 border border-gray-300 rounded-full text-gray-700 text-base sm:text-sm focus:outline-none focus:border-red-400"
            />
            <GameSelect
              value={dupGame}
              onChange={(g) => {
                setDupGame(g);
                setDupError(null);
              }}
            />
            <button
              type="submit"
              disabled={busy}
              className="px-5  h-[45px] sm:h-auto py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition cursor-pointer disabled:opacity-50"
            >
              {busy ? "Duplicating..." : "Duplicate"}
            </button>
            <button
              type="button"
              onClick={() => setDuplicating(false)}
              className="min-h-[45px] sm:min-h-0 px-2 text-sm font-semibold text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Cancel
            </button>
          </form>
          <p
            className={`text-xs px-4 mt-2 ${dupError ? "text-red-500" : "text-gray-400"}`}
          >
            {dupError ??
              "Anything not valid in the chosen game is removed from the copy."}
          </p>
        </div>
      )}
      {exporting && team.members.length > 0 && (
        <ExportPanel
          members={team.members}
          onClose={() => setExporting(false)}
        />
      )}
      {/* Aviso de lo que se quitó al duplicar */}
      {notes.length > 0 && !notesHidden && (
        <div className="relative mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 pr-10">
          <button
            onClick={() => setNotesHidden(true)}
            title="Dismiss"
            className="absolute top-0 right-0 w-[45px] h-[45px] flex items-center justify-center text-amber-500 hover:text-amber-700 cursor-pointer"
          >
            ✕
          </button>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-1">
            Changes made to this team
          </p>
          <ul className="text-sm text-amber-900 list-disc pl-5">
            {notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}
      {/* 1) Análisis, plegable */}
      {team.members.length > 0 && (
        <TeamAnalysis members={team.members} game={game} />
      )}
      {/* 2) Los 6 casilleros: se pueden arrastrar para reordenar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: TEAM_SIZE }, (_, i) => {
          const m = team.members[i];
          const isOver = dragOver === i && dragFrom !== i;

          if (!m) {
            return (
              <div
                key={i}
                onClick={focusSearch}
                onDragOver={allowDrop(i)}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => handleDrop(i)}
                className={`flex items-center justify-center h-48 rounded-xl border-2 border-dashed text-xs cursor-pointer transition ${
                  isOver
                    ? "border-red-400 text-red-400"
                    : "border-gray-200 text-gray-300 hover:border-red-300 hover:text-red-400"
                }`}
              >
                + Add Pokémon
              </div>
            );
          }

          const entry = ENTRY_BY_ID.get(m.pokemonId);
          const mega = forms[i]?.mega;
          return (
            <div
              key={i}
              draggable={canDrag}
              onDragStart={(e) => {
                // Firefox no arrastra si no hay datos
                e.dataTransfer.setData("text/plain", String(i));
                e.dataTransfer.effectAllowed = "move";
                setDragFrom(i);
              }}
              onDragEnd={resetDrag}
              onDragOver={allowDrop(i)}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(i)}
              onClick={() => setSelected(i === selected ? null : i)}
              className={`relative flex flex-col items-center gap-1 h-48 p-3 rounded-xl border transition ${
                canDrag
                  ? "cursor-grab active:cursor-grabbing"
                  : "cursor-pointer"
              } ${dragFrom === i ? "opacity-40" : ""} ${
                isOver
                  ? "border-red-400 border-dashed bg-red-50"
                  : i === selected
                    ? "border-red-400 bg-white"
                    : "border-gray-200 bg-gray-50 hover:border-red-300"
              }`}
            >
              {/* Celular: flechas para reordenar (arrastrar solo anda con mouse) */}
              {!canDrag && i > 0 && (
                <button
                  onClick={(e) => {
                    // Que el click no abra el panel de este casillero
                    e.stopPropagation();
                    move(i, i - 1);
                  }}
                  aria-label="Move left"
                  className="absolute top-0 left-0 w-[45px] h-[45px] flex items-center justify-center rounded-tl-xl text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
              )}
              {!canDrag && i < team.members.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    move(i, i + 1);
                  }}
                  aria-label="Move right"
                  className="absolute top-0 right-0 w-[45px] h-[45px] flex items-center justify-center rounded-tr-xl text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              )}
              <SpriteImg
                src={
                  mega
                    ? cdnSprite(
                        art
                          ? mega.sprites.other?.["official-artwork"]
                              ?.front_default
                          : mega.sprites.front_default,
                      )
                    : teamSpriteUrl(m.pokemonId, game)
                }
                alt=""
                className={`${art ? "w-20 h-20" : "w-24 h-24"} object-contain pointer-events-none`}
                style={spriteStyle(!art)}
              />

              <Link
                to={`/details/${m.pokemonId}`}
                draggable={false}
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-bold text-gray-900 hover:text-red-600 text-center leading-tight"
              >
                {mega
                  ? megaLabel(mega.name)
                  : entry
                    ? getRegionalDisplayName(entry.name)
                    : `#${m.pokemonId}`}
              </Link>
              <div className="flex gap-0.5 [&_.type-badge]:flex-none [&_.type-badge]:w-[72px] [&_.type-badge]:max-w-none [&_.type-badge]:whitespace-nowrap">
                {(mega
                  ? mega.types.map((t) => t.type.name)
                  : entry?.types
                )?.map((t) => (
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
                className="relative mt-auto text-xs font-semibold text-gray-400 hover:text-red-500 transition cursor-pointer after:absolute after:-inset-x-4 after:-inset-y-[15px]"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
      {/* 3) El panel del miembro elegido */}
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
      {/* 4) La galería: buscador, filtros y caja */}
      <PokemonBox
        game={game}
        members={team.members}
        full={full}
        onAdd={(id) => addMember(team.id, id)}
        inputRef={searchRef}
      />
    </section>
  );
}
