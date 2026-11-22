import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useItemNames } from "../hooks/useItemNames";
import { usePagedList } from "../hooks/usePagedList";
import { useItemCategoryMap } from "../hooks/useItemCategoryMap";
import {
  useListControls,
  filterAndSort,
  byName,
  byMap,
} from "../hooks/useListControls";
import { getItem, getItemsInGroup } from "../lib/api";
import { ITEM_GROUPS } from "../lib/itemGroups";
import { SearchBar } from "../components/SearchBar";
import { ItemRow } from "../components/items/ItemRow";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { LetterStrip } from "../components/lists/LetterStrip";
import { LoadMoreButton } from "../components/LoadMoreButton";

export function Items() {
  const c = useListControls<"name" | "category">();
  const [group, setGroup] = useState("all");

  const { data: allNames = [] } = useItemNames();

  const current = ITEM_GROUPS.find((g) => g.key === group)!;

  const { data: groupNames } = useQuery({
    queryKey: ["item-group", group],
    queryFn: () => getItemsInGroup(current.categories),
    enabled: group !== "all",
    staleTime: Infinity,
  });

  // Solo se pide si hace falta ordenar por categoría
  const { data: catMap } = useItemCategoryMap(c.sortKey === "category");

  const names = useMemo(() => {
    const base = group === "all" ? allNames : (groupNames ?? []);
    const compare =
      c.sortKey === "name"
        ? byName
        : c.sortKey === "category" && catMap
          ? byMap(catMap)
          : undefined;
    return filterAndSort(base, c.q, c.letter, c.sortDir, compare);
  }, [
    group,
    allNames,
    groupNames,
    c.q,
    c.letter,
    c.sortKey,
    c.sortDir,
    catMap,
  ]);

  // Todo lo que cambia la lista tiene que estar en la clave de caché
  const listKey = `${group}|${c.q}|${c.letter ?? ""}|${c.sortKey}|${c.sortDir}|${
    catMap ? 1 : 0
  }`;
  // Los que no tienen sprite son placeholders internos de los juegos
  const list = usePagedList("item", names, listKey, getItem, (i) =>
    Boolean(i.sprites.default),
  );
  const items = list.data?.pages.flat() ?? [];

  function clearAll() {
    c.reset();
    setGroup("all");
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Items</h2>
      </div>

      <SearchBar
        key={c.resetKey}
        onSearch={c.setSearch}
        placeholder="Search Items by name..."
      />

      <div className="filter-bar items-center">
        <label className="text-sm font-semibold text-gray-700">Category:</label>
        <select
          value={group}
          onChange={(e) => {
            setGroup(e.target.value);
            c.setOpen(null);
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
          value={`${c.sortKey}:${c.sortDir}`}
          onChange={(e) => c.pickSort(e.target.value)}
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

      <LetterStrip letter={c.letter} onPick={c.pickLetter} />

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
                  c.sortKey === "name" ? " is-active" : ""
                }`}
                onClick={() => c.toggleSort("name")}
              >
                Name <span className="item-sort-arrow">{c.arrow("name")}</span>
              </button>
              <button
                className={`item-head-cell${
                  c.sortKey === "category" ? " is-active" : ""
                }`}
                onClick={() => c.toggleSort("category")}
              >
                Category{" "}
                <span className="item-sort-arrow">{c.arrow("category")}</span>
              </button>
              <span className="item-head-cell is-static">Effect</span>
            </div>

            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                open={c.open === item.name}
                onToggle={() => c.toggleOpen(item.name)}
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
