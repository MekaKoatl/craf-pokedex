import type { Selection } from "../../hooks/useSelection";

type Props<K extends string> = {
  /** Clave de orden elegida. */
  sort: K;
  /** Opciones del selector de orden, con su texto. */
  sortLabels: Record<K, string>;
  onSort: (sort: K) => void;
  selection: Selection;
  /** Se llama al tocar "Delete" con al menos un elemento marcado. */
  onDelete: () => void;
};

/**
 * Barra sobre la grilla de listas o equipos: selector de orden y
 * botones del modo selección (Select / Select all / Delete / Cancel).
 */
export function CollectionToolbar<K extends string>({
  sort,
  sortLabels,
  onSort,
  selection: s,
  onDelete,
}: Props<K>) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <select
        value={sort}
        onChange={(e) => onSort(e.target.value as K)}
        className="item-select"
      >
        {(Object.keys(sortLabels) as K[]).map((k) => (
          <option key={k} value={k}>
            {sortLabels[k]}
          </option>
        ))}
      </select>

      {s.selecting ? (
        <>
          <button onClick={s.toggleAll} className="btn-ghost">
            {s.allSelected ? "Unselect all" : "Select all"}
          </button>
          <button
            onClick={onDelete}
            disabled={s.selected.length === 0}
            className="btn-primary min-h-[45px] sm:min-h-0 px-4 py-1.5 rounded-full text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Delete ({s.selected.length})
          </button>
          <button onClick={s.stop} className="btn-ghost">
            Cancel
          </button>
        </>
      ) : (
        <button onClick={s.start} className="btn-ghost">
          Select
        </button>
      )}
    </div>
  );
}
