import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTeams } from "../../hooks/useTeams";
import { GAME_BY_ID } from "../../lib/games";
import { getPokemonFull } from "../../lib/api";
import { fromShowdown } from "../../lib/showdown";
import { transferMembers } from "../../lib/teamTransfer";
import { GameSelect } from "./GameSelect";

const EXAMPLE = `Garchomp @ Choice Scarf
Ability: Rough Skin
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Earthquake
- Outrage`;

// Pegar un equipo de Showdown y crear un equipo nuevo con él
export function ImportPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { createTeam, teamNameError } = useTeams();
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleImport(e: FormEvent) {
    e.preventDefault();
    const err =
      teamNameError(name) ??
      (game ? null : "Choose a game.") ??
      (text.trim() ? null : "Paste a team first.");
    if (err) {
      setError(err);
      return;
    }
    const target = GAME_BY_ID.get(game);
    if (!target) return;

    // 1) Leer el texto
    const parsed = fromShowdown(text);
    if (parsed.members.length === 0) {
      setError("No Pokémon were recognized in the text.");
      return;
    }

    setBusy(true);
    try {
      // 2) Quitar lo que no vale en el juego elegido (lo mismo que Duplicate)
      const result = await transferMembers(parsed.members, target, (id) =>
        queryClient.fetchQuery({
          queryKey: ["pokemon-full", id],
          queryFn: () => getPokemonFull(id),
          staleTime: Infinity,
        }),
      );
      // 3) Crear el equipo e ir a editarlo, con el aviso de lo que cambió
      const id = createTeam(name, game, result.members);
      if (!id) return;
      navigate(`/team-planner/${id}`, {
        state: { notes: [...parsed.notes, ...result.notes] },
      });
    } catch {
      setError("Couldn't load the Pokémon data. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
      <button
        type="button"
        onClick={onClose}
        title="Close"
        className="absolute top-1 right-1 w-[45px] h-[45px] flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-lg cursor-pointer"
      >
        ✕
      </button>
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2 pr-10">
        Import from Showdown
      </p>

      <form onSubmit={handleImport}>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          rows={10}
          placeholder={EXAMPLE}
          // 16px en celular: con menos, el iPhone hace zoom
          className="w-full p-3 border border-gray-300 rounded-lg bg-white font-mono text-base sm:text-xs text-gray-700 focus:outline-none focus:border-red-400"
        />

        <div className="flex flex-wrap gap-2 mt-2">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="Team name..."
            maxLength={40}
            className="flex-1 min-w-48 px-4 h-[45px] sm:h-auto py-2 border border-gray-300 rounded-full text-gray-700 text-base sm:text-sm bg-white focus:outline-none focus:border-red-400"
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
            disabled={busy}
            className="min-h-[45px] sm:min-h-0 px-5 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition cursor-pointer disabled:opacity-50"
          >
            {busy ? "Importing..." : "Import"}
          </button>
        </div>
      </form>

      <p
        className={`text-xs px-4 mt-2 ${error ? "text-red-500" : "text-gray-400"}`}
      >
        {error ??
          "In Showdown: Teambuilder → your team → Import/Export. Anything not valid in the chosen game is removed."}
      </p>
    </div>
  );
}