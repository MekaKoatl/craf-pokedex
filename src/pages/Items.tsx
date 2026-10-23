import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useItemNames } from "../hooks/useItemNames";
import { useItemList } from "../hooks/useItemList";
import { useItemCategoryMap } from "../hooks/useItemCategoryMap";
import { getItemsInGroup } from "../lib/api";
import { ITEM_GROUPS } from "../lib/itemGroups";
import { normalize } from "../lib/text";
import { SearchBar } from "../components/SearchBar";
import { ItemRow } from "../components/items/ItemRow";
import { LoadingSpinner } from "../components/LoadingSpinner";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type SortKey = "default" | "name" | "category";


export function Items() {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [letter, setLetter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { data: allNames = [] } = useItemNames();

  const current = ITEM_GROUPS.find((g) => g.key === group)!;

  const { data: groupNames } = useQuery({
    queryKey: ["item-group", group],
    queryFn: () => getItemsInGroup(current.categories),
    enabled: group !== "all",
    staleTime: Infinity,
  });

  // Solo se pide si hace falta ordenar por categoría
  const { data: catMap } = useItemCategoryMap(sortKey === "category");

  const base = group === "all" ? allNames : (groupNames ?? []);
  const q = normalize(search);

  const names = useMemo(() => {
    let out = base;
    if (q) out = out.filter((n) => normalize(n).includes(q));
    if (letter) out = out.filter((n) => n.charAt(0).toUpperCase() === letter);

    const sorted = sortKey === "name" || (sortKey === "category" && !!catMap);
    if (sortKey === "name") {
      out = [...out].sort((a, b) => a.localeCompare(b));
    } else if (sortKey === "category" && catMap) {
      // Empate de categoría se desempata por nombre
      out = [...out].sort(
        (a, b) =>
          (catMap[a] ?? "~").localeCompare(catMap[b] ?? "~") ||
          a.localeCompare(b),
      );
    }
    if (sorted && sortDir === "desc") out = [...out].reverse();
    return out;
  }, [base, q, letter, sortKey, sortDir, catMap]);

  // Todo lo que cambia la lista tiene que estar en la clave de caché
  const listKey = `${group}|${q}|${letter ?? ""}|${sortKey}|${sortDir}|${
    catMap ? 1 : 0
  }`;
  const list = useItemList(names, listKey);
  const items = list.data?.pages.flat() ?? [];

  // 1er click asc, 2do desc, 3ro vuelve al orden original
  function toggleSort(key: "name" | "category") {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey("default");
      setSortDir("asc");
    }
    setOpenItem(null);
  }

  function arrow(key: "name" | "category") {
    if (sortKey !== key) return "⇅";
    return sortDir === "asc" ? "▲" : "▼";
  }

  function clearAll() {
    setGroup("all");
    setSearch("");
    setOpenItem(null);
    setLetter(null);
    setSortKey("default");
    setSortDir("asc");
    setResetKey((k) => k + 1); // fuerza a SearchBar a reiniciarse
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Items</h2>
      </div>

      <SearchBar
        key={resetKey}
        onSearch={setSearch}
        placeholder="Search Items by name..."
      />

      <div className="filter-bar items-center">
        <label className="text-sm font-semibold text-gray-700">Category:</label>
        <select
          value={group}
          onChange={(e) => {
            setGroup(e.target.value);
            setOpenItem(null);
          }}
          className="item-select"
        >
          {ITEM_GROUPS.map((g) => (
            <option key={g.key} value={g.key}>
              {g.label}
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
            setOpenItem(null);
          }}
        >
          <option value="default:asc">Default order</option>
          <option value="name:asc">Name A–Z</option>
          <option value="name:desc">Name Z–A</option>
          <option value="category:asc">Category A–Z</option>
          <option value="category:desc">Category Z–A</option>
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
            setOpenItem(null);
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
              setOpenItem(null);
            }}
          >
            {L}
          </button>
        ))}
      </div>

      {list.isLoading ? (
        <LoadingSpinner text="Loading items..." />
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No items found.</p>
      ) : (
        <>
          <div className="item-table">
            <div className="item-head">
              <button
                className={`item-head-cell${
                  sortKey === "name" ? " is-active" : ""
                }`}
                onClick={() => toggleSort("name")}
              >
                Name <span className="item-sort-arrow">{arrow("name")}</span>
              </button>
              <button
                className={`item-head-cell${
                  sortKey === "category" ? " is-active" : ""
                }`}
                onClick={() => toggleSort("category")}
              >
                Category{" "}
                <span className="item-sort-arrow">{arrow("category")}</span>
              </button>
              <span className="item-head-cell is-static">Effect</span>
            </div>

            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                open={openItem === item.name}
                onToggle={() =>
                  setOpenItem(openItem === item.name ? null : item.name)
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