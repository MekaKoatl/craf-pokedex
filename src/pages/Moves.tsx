import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMoveNames } from "../hooks/useMoveNames";
import { usePagedList } from "../hooks/usePagedList";
import { useMoveTypeMap } from "../hooks/useMoveTypeMap";
import { useMoveCategoryMap } from "../hooks/useMoveCategoryMap";
import {
  useListControls,
  filterAndSort,
  byName,
  byMap,
} from "../hooks/useListControls";
import { getMove, getMovesOfType, getMovesInDamageClass } from "../lib/api";
import { MOVE_TYPES, MOVE_CATEGORIES } from "../lib/moves";
import { prettyName } from "../lib/text";
import { SearchBar } from "../components/SearchBar";
import { MoveRow } from "../components/moves/MoveRow";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { LetterStrip } from "../components/lists/LetterStrip";
import { LoadMoreButton } from "../components/LoadMoreButton";

/**
 * Página Moves (`/moves`): lista de movimientos con búsqueda, filtros por
 * tipo, categoría y letra, orden por nombre, tipo o categoría y fila expandible.
 */
export function Moves() {
  const c = useListControls<"name" | "type" | "cat">();
  const [type, setType] = useState("all");
  const [cat, setCat] = useState("all");

  const { data: allNames = [] } = useMoveNames();

  // El filtro por tipo pide solo la lista de ese tipo
  const { data: typeNames } = useQuery({
    queryKey: ["move-type", type],
    queryFn: () => getMovesOfType(type),
    enabled: type !== "all",
    staleTime: Infinity,
  });

  const { data: catNames } = useQuery({
    queryKey: ["move-damage-class", cat],
    queryFn: () => getMovesInDamageClass(cat),
    enabled: cat !== "all",
    staleTime: Infinity,
  });

  // Los mapas completos solo se piden al ordenar por esa columna
  const { data: typeMap } = useMoveTypeMap(c.sortKey === "type");
  const { data: catMap } = useMoveCategoryMap(c.sortKey === "cat");

  // Combina los filtros: lista del tipo, intersectada con la de la categoría
  const base = useMemo(() => {
    let out = allNames;
    if (type !== "all") out = typeNames ?? [];
    if (cat !== "all") {
      const set = new Set(catNames ?? []);
      out = out.filter((n) => set.has(n));
    }
    return out;
  }, [allNames, type, typeNames, cat, catNames]);

  const names = useMemo(() => {
    // Por categoría el orden alfabético es physical < special < status
    const compare =
      c.sortKey === "name"
        ? byName
        : c.sortKey === "type" && typeMap
          ? byMap(typeMap)
          : c.sortKey === "cat" && catMap
            ? byMap(catMap)
            : undefined;
    return filterAndSort(base, c.q, c.letter, c.sortDir, compare);
  }, [base, c.q, c.letter, c.sortKey, c.sortDir, typeMap, catMap]);

  // La clave de caché incluye todo lo que cambia la lista
  const listKey = `${type}|${cat}|${c.q}|${c.letter ?? ""}|${c.sortKey}|${
    c.sortDir
  }|${typeMap ? 1 : 0}|${catMap ? 1 : 0}`;

  const list = usePagedList("move", names, listKey, getMove);

  const moves = list.data?.pages.flat() ?? [];

  function clearAll() {
    c.reset();
    setType("all");
    setCat("all");
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Moves</h2>
      </div>

      <SearchBar
        key={c.resetKey}
        onSearch={c.setSearch}
        placeholder="Search Moves by name..."
      />

      <div className="filter-bar items-center">
        <label className="text-sm font-semibold text-gray-700">Type:</label>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            c.setOpen(null);
          }}
          className="item-select"
        >
          <option value="all">– All –</option>
          {MOVE_TYPES.map((t) => (
            <option key={t} value={t}>
              {prettyName(t)}
            </option>
          ))}
        </select>

        {/* En celular no hay encabezados: el orden se elige con este selector */}
        <select
          className="item-select sm:hidden"
          value={`${c.sortKey}:${c.sortDir}`}
          onChange={(e) => c.pickSort(e.target.value)}
        >
          <option value="default:asc">Default order</option>
          <option value="name:asc">Name A–Z</option>
          <option value="name:desc">Name Z–A</option>
          <option value="type:asc">Type A–Z</option>
          <option value="type:desc">Type Z–A</option>
          <option value="cat:asc">Category A–Z</option>
          <option value="cat:desc">Category Z–A</option>
        </select>

        <label className="text-sm font-semibold text-gray-700">Category:</label>
        <select
          value={cat}
          onChange={(e) => {
            setCat(e.target.value);
            c.setOpen(null);
          }}
          className="item-select"
        >
          <option value="all">– All –</option>
          {MOVE_CATEGORIES.map((m) => (
            <option key={m} value={m}>
              {prettyName(m)}
            </option>
          ))}
        </select>

        <button className="filter-dropdown-btn" onClick={clearAll}>
          Clear all
        </button>
      </div>

      <LetterStrip letter={c.letter} onPick={c.pickLetter} />

      {list.isLoading ? (
        <LoadingSpinner text="Loading moves..." />
      ) : moves.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No moves found.</p>
      ) : (
        <>
          <div className="move-table">
            <div className="move-head">
              <button
                className={`move-head-cell${
                  c.sortKey === "name" ? " is-active" : ""
                }`}
                onClick={() => c.toggleSort("name")}
              >
                Name <span className="item-sort-arrow">{c.arrow("name")}</span>
              </button>
              <button
                className={`move-head-cell${
                  c.sortKey === "type" ? " is-active" : ""
                }`}
                onClick={() => c.toggleSort("type")}
              >
                Type <span className="item-sort-arrow">{c.arrow("type")}</span>
              </button>
              <button
                className={`move-head-cell${
                  c.sortKey === "cat" ? " is-active" : ""
                }`}
                onClick={() => c.toggleSort("cat")}
              >
                Cat. <span className="item-sort-arrow">{c.arrow("cat")}</span>
              </button>
              <span className="move-head-cell is-static">Power</span>
              <span className="move-head-cell is-static">Acc.</span>
              <span className="move-head-cell is-static">PP</span>
              <span className="move-head-cell is-static">Effect</span>
            </div>
            {moves.map((m) => (
              <MoveRow
                key={m.id}
                move={m}
                open={c.open === m.name}
                onToggle={() => c.toggleOpen(m.name)}
              />
            ))}
          </div>

          <LoadMoreButton
            show={list.hasNextPage}
            loading={list.isFetchingNextPage}
            onClick={() => list.fetchNextPage()}
          />
        </>
      )}
    </section>
  );
}
