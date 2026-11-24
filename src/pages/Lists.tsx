import { useState, type FormEvent } from "react";
import { useLists } from "../hooks/useLists";
import { MAX_LISTS, type PokemonList } from "../context/ListsContext";
import { PokemonIcon } from "../components/PokemonIcon";
import { compareDex } from "../lib/dexOrder";
import {
  COLLECTION_SORT_LABELS,
  sortCollection,
  type CollectionSort,
} from "../lib/collections";
import { useSelection } from "../hooks/useSelection";
import { CollectionToolbar } from "../components/collection/CollectionToolbar";
import { SelectableCard } from "../components/collection/SelectableCard";

/** Íconos de vista previa en cada tarjeta. */
const PREVIEW = 6;

/** Contenido de la tarjeta de una lista: nombre, cantidad y vista previa. */
function CardBody({ list }: { list: PokemonList }) {
  const preview = [...list.pokemon].sort(compareDex).slice(0, PREVIEW);
  const extra = list.pokemon.length - preview.length;

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
          preview.map((id) => <PokemonIcon key={id} id={id} />)
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

/**
 * Página Lists (`/lists`): crear listas y ver, ordenar, seleccionar y
 * borrar las existentes.
 */
export function Lists() {
  const { lists, createList, deleteList, listNameError } = useLists();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [sort, setSort] = useState<CollectionSort>("oldest");

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    const err = listNameError(name);
    if (err) {
      setError(err);
      return;
    }
    createList(name);
    setName("");
  }

  const visible = sortCollection(lists, sort);
  const selection = useSelection(visible.map((l) => l.id));

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Lists</h2>

      {/* Crear lista */}
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
          className="flex-1 px-4 h-[45px] sm:h-auto py-2 border border-gray-300 rounded-full text-gray-700 text-base sm:text-sm focus:outline-none focus:border-red-400"
        />
        <button
          type="submit"
          className="btn-primary min-h-[45px] sm:min-h-0 px-5 py-2 rounded-full text-sm"
        >
          Create
        </button>
      </form>

      {/* Error o cantidad de listas */}
      <p
        className={`text-xs px-4 mb-6 ${error ? "text-red-500" : "text-gray-400"}`}
      >
        {error ?? `${lists.length} / ${MAX_LISTS} lists`}
      </p>

      {lists.length > 0 && (
        <CollectionToolbar
          sort={sort}
          sortLabels={COLLECTION_SORT_LABELS}
          onSort={setSort}
          selection={selection}
          onDelete={() =>
            selection.deleteSelected(deleteList, ["list", "lists"])
          }
        />
      )}

      {lists.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          You don't have any lists yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((l) => (
            <SelectableCard
              key={l.id}
              to={`/lists/${l.id}`}
              selecting={selection.selecting}
              selected={selection.selected.includes(l.id)}
              onToggle={() => selection.toggle(l.id)}
            >
              <CardBody list={l} />
            </SelectableCard>
          ))}
        </div>
      )}
    </section>
  );
}
