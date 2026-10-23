import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMoveNames } from "../hooks/useMoveNames";
import { useMoveList } from "../hooks/useMoveList";
import { useMoveTypeMap } from "../hooks/useMoveTypeMap";
import { getMovesOfType, getMovesInDamageClass } from "../lib/api";
import { MOVE_TYPES, MOVE_CATEGORIES } from "../lib/moves";
import { normalize, prettyName } from "../lib/text";
import { SearchBar } from "../components/SearchBar";
import { MoveRow } from "../components/moves/MoveRow";
import { LoadingSpinner } from "../components/LoadingSpinner";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type SortKey = "default" | "name" | "type";

export function Moves() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [cat, setCat] = useState("all");
  const [openMove, setOpenMove] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [letter, setLetter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { data: allNames = [] } = useMoveNames();

  // El filtro pide un solo tipo; es una request
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

  // El orden sí necesita el mapa completo, y solo entonces se pide
  const { data: typeMap } = useMoveTypeMap(sortKey === "type");

  // Los dos filtros se combinan: tipo primero, categoría como intersección
  const base = useMemo(() => {
    let out = allNames;
    if (type !== "all") out = typeNames ?? [];
    if (cat !== "all") {
      const set = new Set(catNames ?? []);
      out = out.filter((n) => set.has(n));
    }
    return out;
  }, [allNames, type, typeNames, cat, catNames]);
  const q = normalize(search);

  const names = useMemo(() => {
    let out = base;
    if (q) out = out.filter((n) => normalize(n).includes(q));
    if (letter) out = out.filter((n) => n.charAt(0).toUpperCase() === letter);

    const sorted = sortKey === "name" || (sortKey === "type" && !!typeMap);
    if (sortKey === "name") {
      out = [...out].sort((a, b) => a.localeCompare(b));
    } else if (sortKey === "type" && typeMap) {
      // Empate de tipo se desempata por nombre
      out = [...out].sort(
        (a, b) =>
          (typeMap[a] ?? "~").localeCompare(typeMap[b] ?? "~") ||
          a.localeCompare(b),
      );
    }
    if (sorted && sortDir === "desc") out = [...out].reverse();
    return out;
  }, [base, q, letter, sortKey, sortDir, typeMap]);

  // Todo lo que cambia la lista tiene que estar en la clave de caché
  const listKey = `${type}|${cat}|${q}|${letter ?? ""}|${sortKey}|${sortDir}|${
    typeMap ? 1 : 0
  }`;
  const list = useMoveList(names, listKey);
  const moves = list.data?.pages.flat() ?? [];

  // 1er click asc, 2do desc, 3ro vuelve al orden original
  function toggleSort(key: "name" | "type") {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey("default");
      setSortDir("asc");
    }
    setOpenMove(null);
  }

  function arrow(key: "name" | "type") {
    if (sortKey !== key) return "⇅";
    return sortDir === "asc" ? "▲" : "▼";
  }

  function clearAll() {
    setType("all");
    setCat("all");
    setSearch("");
    setOpenMove(null);
    setLetter(null);
    setSortKey("default");
    setSortDir("asc");
    setResetKey((k) => k + 1);
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Moves</h2>
      </div>

      <SearchBar
        key={resetKey}
        onSearch={setSearch}
        placeholder="Search Moves by name..."
      />

      <div className="filter-bar items-center">
        <label className="text-sm font-semibold text-gray-700">Type:</label>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setOpenMove(null);
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

        {/* En mobile no hay encabezados, el orden se elige acá */}
        <select
          className="item-select sm:hidden"
          value={`${sortKey}:${sortDir}`}
          onChange={(e) => {
            const [k, d] = e.target.value.split(":");
            setSortKey(k as SortKey);
            setSortDir(d as "asc" | "desc");
            setOpenMove(null);
          }}
        >
          <option value="default:asc">Default order</option>
          <option value="name:asc">Name A–Z</option>
          <option value="name:desc">Name Z–A</option>
          <option value="type:asc">Type A–Z</option>
          <option value="type:desc">Type Z–A</option>
        </select>

        <label className="text-sm font-semibold text-gray-700">Category:</label>
        <select
          value={cat}
          onChange={(e) => {
            setCat(e.target.value);
            setOpenMove(null);
          }}
          className="item-select"
        >
          <option value="all">– All –</option>
          {MOVE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {prettyName(c)}
            </option>
          ))}
        </select>

        <button className="filter-dropdown-btn" onClick={clearAll}>
          Clear all
        </button>
      </div>

      {/* Tira de letras */}
      <div className="item-letters">
        <button
          className={`item-letter${letter === null ? " is-active" : ""}`}
          onClick={() => {
            setLetter(null);
            setOpenMove(null);
          }}
        >
          All
        </button>
        {LETTERS.map((L) => (
          <button
            key={L}
            className={`item-letter${letter === L ? " is-active" : ""}`}
            onClick={() => {
              setLetter(letter === L ? null : L);
              setOpenMove(null);
            }}
          >
            {L}
          </button>
        ))}
      </div>

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
                  sortKey === "name" ? " is-active" : ""
                }`}
                onClick={() => toggleSort("name")}
              >
                Name <span className="item-sort-arrow">{arrow("name")}</span>
              </button>
              <button
                className={`move-head-cell${
                  sortKey === "type" ? " is-active" : ""
                }`}
                onClick={() => toggleSort("type")}
              >
                Type <span className="item-sort-arrow">{arrow("type")}</span>
              </button>
              <span className="move-head-cell is-static">Cat.</span>
              <span className="move-head-cell is-static">Power</span>
              <span className="move-head-cell is-static">Acc.</span>
              <span className="move-head-cell is-static">PP</span>
              <span className="move-head-cell is-static">Effect</span>
            </div>

            {moves.map((m) => (
              <MoveRow
                key={m.id}
                move={m}
                open={openMove === m.name}
                onToggle={() =>
                  setOpenMove(openMove === m.name ? null : m.name)
                }
              />
            ))}
          </div>

          {list.hasNextPage && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => list.fetchNextPage()}
                disabled={list.isFetchingNextPage}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {list.isFetchingNextPage ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
