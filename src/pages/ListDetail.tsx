import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { useLists } from "../hooks/useLists";
import { POKEMON_DATA } from "../data/pokemon-data";
import { fetchPokemonById } from "../lib/api";
import { getRegionalDisplayName } from "../lib/regional";
import { iconOrSprite } from "../lib/sprites";
import { compareDex, dexNumber } from "../lib/dexOrder";
import { DexCard } from "../components/DexCard";
import { SpriteImg } from "../components/SpriteImg";
import { LoadingSpinner } from "../components/LoadingSpinner";
import type { Pokemon } from "../types/pokemon";

// Cuántos resultados muestra el buscador
const MAX_RESULTS = 8;

export function ListDetail() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const {
    lists,
    renameList,
    deleteList,
    isInList,
    toggleInList,
    listNameError,
  } = useLists();
  const list = lists.find((l) => l.id === listId);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);

  // Los hooks van antes de cualquier return, aunque la lista no exista
  const ids = list ? [...list.pokemon].sort(compareDex) : [];
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["list-pokemon", id],
      queryFn: () => fetchPokemonById(id),
      staleTime: Infinity,
    })),
  });
  const pokes = results.map((r) => r.data).filter((p): p is Pokemon => !!p);
  const loading = results.some((r) => r.isLoading);

  // Buscador: por nombre interno o por nombre visible ("alolan")
  const q = search.trim().toLowerCase();
  const matches = q
    ? POKEMON_DATA.filter(
        (e) =>
          e.name.includes(q) ||
          getRegionalDisplayName(e.name).toLowerCase().includes(q),
      )
        .sort((a, b) => compareDex(a.id, b.id))
        .slice(0, MAX_RESULTS)
    : [];

  if (!list) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-500 mb-4">This list doesn't exist.</p>
        <Link to="/lists" className="text-sm text-red-500 font-semibold">
          ← Back to lists
        </Link>
      </section>
    );
  }

  const startEdit = () => {
    setDraft(list.name);
    setRenameError(null);
    setEditing(true);
  };

  const handleRename = (e: FormEvent) => {
    e.preventDefault();
    const err = listNameError(draft, list.id);
    if (err) {
      setRenameError(err);
      return;
    }
    renameList(list.id, draft);
    setEditing(false);
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${list.name}"?`)) return;
    deleteList(list.id);
    navigate("/lists", { replace: true });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <Link
        to="/lists"
        className="text-sm text-gray-400 hover:text-gray-600 transition"
      >
        ← Lists
      </Link>

      {/* Título, o el formulario para renombrar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-2 mb-6">
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
            <h2 className="text-2xl font-bold text-gray-900">
              {list.name}{" "}
              <span className="text-base font-semibold text-gray-400">
                ({list.pokemon.length})
              </span>
            </h2>
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
                Delete list
              </button>
            </div>
          </>
        )}
      </div>

      {editing && renameError && (
        <p className="text-xs text-red-500 -mt-4 mb-6">{renameError}</p>
      )}
      <div className="relative mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setSearch("")}
          placeholder="Add Pokémon to this list..."
          className="w-full px-4 py-2 border border-gray-300 rounded-full text-gray-700 text-sm focus:outline-none focus:border-red-400"
        />
        {q && (
          <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {matches.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400">
                No Pokémon found.
              </li>
            ) : (
              matches.map((e) => {
                const added = isInList(list.id, e.id);
                return (
                  <li key={e.id}>
                    <button
                      onClick={() => toggleInList(list.id, e.id)}
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
                      <span
                        className={`text-xs font-semibold ${
                          added ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {added ? "✓ Added" : "+ Add"}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      {/* Los Pokémon de la lista, en orden de Pokédex */}
      {list.pokemon.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          This list is empty. Use the search bar to add Pokémon.
        </p>
      ) : loading && pokes.length === 0 ? (
        <LoadingSpinner text="Loading Pokémon..." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {pokes.map((p) => (
            <div key={p.id} className="flex flex-col gap-1">
              <DexCard pokemon={p} />
              <button
                onClick={() => toggleInList(list.id, p.id)}
                className="text-xs font-semibold text-gray-400 hover:text-red-500 transition cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
