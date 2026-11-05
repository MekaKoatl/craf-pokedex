import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { useLists } from "../hooks/useLists";
import { useFilters } from "../hooks/useFilters";
import { fetchPokemonById } from "../lib/api";
import { compareDex } from "../lib/dexOrder";
import { matchesFilters } from "../lib/matchFilters";
import { DexCard } from "../components/DexCard";
import { FilterBar } from "../components/filters/FilterBar";
import { AddPokemonSearch } from "../components/AddPokemonSearch";
import { LoadingSpinner } from "../components/LoadingSpinner";
import type { Pokemon } from "../types/pokemon";

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
  const { filters, toggle, clearGroup, clearAll } = useFilters();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
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
  const filtered = pokes.filter((p) => matchesFilters(p.id, filters));

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

      {/* Agregar: en su propia tarjeta, igual que en Favorites */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
          Add Pokémon
        </p>
        <AddPokemonSearch
          isAdded={(id) => isInList(list.id, id)}
          onToggle={(id) => toggleInList(list.id, id)}
          placeholder="Search a Pokémon to add to this list..."
        />
      </div>

      {/* Los Pokémon de la lista, en orden de Pokédex */}
      {list.pokemon.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          This list is empty. Use the search bar to add Pokémon.
        </p>
      ) : (
        <>
          <FilterBar
            filters={filters}
            toggle={toggle}
            clearGroup={clearGroup}
            clearAll={clearAll}
          />

          {loading && pokes.length === 0 ? (
            <LoadingSpinner text="Loading Pokémon..." />
          ) : filtered.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No Pokémon match these filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {filtered.map((p) => (
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
        </>
      )}
    </section>
  );
}
