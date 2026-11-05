import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useLists } from "../hooks/useLists";
import { MAX_LISTS, type PokemonList } from "../context/ListsContext";
import { artworkUrl, boxIconUrl, hasBoxIcon } from "../lib/sprites";
import { SpriteImg } from "../components/SpriteImg";
import { compareDex } from "../lib/dexOrder";

// Cuántos íconos se ven en la tarjeta de cada lista
const PREVIEW = 6;

type SortKey = "oldest" | "newest" | "az" | "za";

const SORT_LABELS: Record<SortKey, string> = {
  oldest: "Oldest first",
  newest: "Newest first",
  az: "Name A–Z",
  za: "Name Z–A",
};

const ghostBtn =
  "px-4 py-1.5 rounded-full border-[1.5px] border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:border-gray-400 transition cursor-pointer";
const cardBase = "border rounded-xl p-4 transition";

// Lo de adentro de la tarjeta: igual en modo normal y en modo selección
function CardBody({ list }: { list: PokemonList }) {
  const preview = [...list.pokemon].sort(compareDex).slice(0, PREVIEW);
  const extra = list.pokemon.length - preview.length;
  // Si algún Pokémon no tiene ícono de PC (Gen VIII en adelante,
  // regionales de Galar/Hisui/Paldea), toda la lista usa arte oficial
  const art = list.pokemon.some((id) => !hasBoxIcon(id));

  return (
    <>
      <h3 className="font-bold text-gray-900 truncate pr-6">{list.name}</h3>
      <p className="text-xs text-gray-400 mt-0.5">
        {list.pokemon.length} Pokémon
      </p>

      <div className="flex items-center gap-1 mt-3 h-10">
        {preview.length === 0 ? (
          <span className="text-xs text-gray-300 italic">Empty</span>
        ) : (
          preview.map((id) => (
            <SpriteImg
              key={id}
              src={art ? artworkUrl(id) : boxIconUrl(id)}
              alt=""
              className={`${art ? "w-9 h-9" : "w-10 h-10"} object-contain`}
              // Pixelado solo para los íconos de PC, no para el arte
              style={art ? undefined : { imageRendering: "pixelated" }}
            />
          ))
        )}
        {extra > 0 && (
          <span className="text-xs font-semibold text-gray-400 ml-1">
            +{extra}
          </span>
        )}
      </div>
    </>
  );
}

export function Lists() {
  const { lists, createList, deleteList, listNameError } = useLists();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [sort, setSort] = useState<SortKey>("oldest");
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  function handleCreate(e: FormEvent) {
    // Un <form> recarga la página por defecto; esto lo evita
    e.preventDefault();
    const err = listNameError(name);
    if (err) {
      setError(err);
      return;
    }
    createList(name);
    setName("");
  }

  // Filtrar por nombre y después ordenar.
  // El array ya viene en orden de creación: "newest" es darlo vuelta.

  const visible =
    sort === "oldest"
      ? lists
      : sort === "newest"
        ? [...lists].reverse()
        : [...lists].sort((a, b) =>
            sort === "az"
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name),
          );

  const allVisibleSelected =
    visible.length > 0 && visible.every((l) => selected.includes(l.id));

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  // Marca todas las que se ven, o las desmarca si ya estaban
  function toggleAll() {
    const ids = visible.map((l) => l.id);
    setSelected((prev) =>
      allVisibleSelected
        ? prev.filter((x) => !ids.includes(x))
        : [...new Set([...prev, ...ids])],
    );
  }

  function stopSelecting() {
    setSelecting(false);
    setSelected([]);
  }

  function handleDeleteSelected() {
    const n = selected.length;
    if (!confirm(`Delete ${n} ${n === 1 ? "list" : "lists"}?`)) return;
    selected.forEach(deleteList);
    stopSelecting();
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Lists</h2>

      {/* Crear lista: Enter o el botón */}
      <form onSubmit={handleCreate} className="flex gap-2 mb-2">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="New list name..."
          maxLength={40}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-gray-700 text-sm focus:outline-none focus:border-red-400"
        />
        <button
          type="submit"
          className="px-5 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition cursor-pointer"
        >
          Create
        </button>
      </form>

      {/* El error, o cuántas listas hay */}
      <p
        className={`text-xs px-4 mb-6 ${error ? "text-red-500" : "text-gray-400"}`}
      >
        {error ?? `${lists.length} / ${MAX_LISTS} lists`}
      </p>

      {/* Barra: filtro, orden y selección */}
      {lists.length > 0 && (
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
                {allVisibleSelected ? "Unselect all" : "Select all"}
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

      {lists.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          You don't have any lists yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((l) => {
            // Modo normal: la tarjeta es un link a la lista
            if (!selecting) {
              return (
                <Link
                  key={l.id}
                  to={`/lists/${l.id}`}
                  className={`${cardBase} bg-gray-50 border-gray-200 hover:border-red-300 hover:bg-white`}
                >
                  <CardBody list={l} />
                </Link>
              );
            }

            // Modo selección: click marca o desmarca
            const isSel = selected.includes(l.id);
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => toggleSelect(l.id)}
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
                <CardBody list={l} />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
