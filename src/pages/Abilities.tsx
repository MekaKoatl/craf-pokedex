import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAbilityNames } from "../hooks/useAbilityNames";
import { useAbilityList } from "../hooks/useAbilityList";
import { useAbilityGenMap } from "../hooks/useAbilityGenMap";
import { normalize } from "../lib/text";
import { SearchBar } from "../components/SearchBar";
import { AbilityRow } from "../components/abilities/AbilityRow";
import { LoadingSpinner } from "../components/LoadingSpinner";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type SortKey = "default" | "name" | "gen";

export function Abilities() {
  const [searchParams, setSearchParams] = useSearchParams();
  // La habilidad que llega desde Details, p. ej. /abilities?open=sticky-hold
  const focus = searchParams.get("open");

  const [search, setSearch] = useState("");
  const [openAbility, setOpenAbility] = useState<string | null>(focus);
  const [resetKey, setResetKey] = useState(0);
  const [letter, setLetter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Si se entra de nuevo con otra habilidad, se abre esa
  useEffect(() => {
    if (focus) setOpenAbility(focus);
  }, [focus]);

  const { data: allNames = [] } = useAbilityNames();

  // Solo se pide si hace falta ordenar por generación
  const { data: genMap } = useAbilityGenMap(sortKey === "gen");

  const q = normalize(search);

  const names = useMemo(() => {
    let out = allNames;
    if (q) out = out.filter((n) => normalize(n).includes(q));
    if (letter) out = out.filter((n) => n.charAt(0).toUpperCase() === letter);

    const sorted = sortKey === "name" || (sortKey === "gen" && !!genMap);
    if (sortKey === "name") {
      out = [...out].sort((a, b) => a.localeCompare(b));
    } else if (sortKey === "gen" && genMap) {
      // Empate de generación se desempata por nombre
      out = [...out].sort(
        (a, b) => (genMap[a] ?? 99) - (genMap[b] ?? 99) || a.localeCompare(b),
      );
    }
    // La que viene de Details se adelanta, así cae en la primera página
    if (focus && out.includes(focus)) {
      out = [focus, ...out.filter((n) => n !== focus)];
    }
    return out;
  }, [allNames, q, letter, sortKey, sortDir, genMap, focus]);

  // Todo lo que cambia la lista tiene que estar en la clave de caché
  const listKey = `${q || "all"}|${letter ?? ""}|${sortKey}|${sortDir}|${
    genMap ? 1 : 0
  }|${focus ?? ""}`;
  const list = useAbilityList(names, listKey);
  const abilities = list.data?.pages.flat() ?? [];

  // 1er click asc, 2do desc, 3ro vuelve al orden original
  function toggleSort(key: "name" | "gen") {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey("default");
      setSortDir("asc");
    }
    setOpenAbility(null);
  }

  function arrow(key: "name" | "gen") {
    if (sortKey !== key) return "⇅";
    return sortDir === "asc" ? "▲" : "▼";
  }

    function clearAll() {
    setSearch("");
    setOpenAbility(null);
    setLetter(null);
    setSortKey("default");
    setSortDir("asc");
    setSearchParams({}, { replace: true }); // suelta la habilidad fijada
    setResetKey((k) => k + 1);
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Abilities</h2>
      </div>

      <SearchBar
        key={resetKey}
        onSearch={setSearch}
        placeholder="Search Ability by name..."
      />

      <div className="filter-bar items-center">
        {/* En mobile no hay encabezados, el orden se elige acá */}
        <select
          className="item-select sm:hidden"
          value={`${sortKey}:${sortDir}`}
          onChange={(e) => {
            const [k, d] = e.target.value.split(":");
            setSortKey(k as SortKey);
            setSortDir(d as "asc" | "desc");
            setOpenAbility(null);
          }}
        >
          <option value="default:asc">Default order</option>
          <option value="name:asc">Name A–Z</option>
          <option value="name:desc">Name Z–A</option>
          <option value="gen:asc">Generation, oldest first</option>
          <option value="gen:desc">Generation, newest first</option>
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
            setOpenAbility(null);
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
              setOpenAbility(null);
            }}
          >
            {L}
          </button>
        ))}
      </div>

      {list.isLoading ? (
        <LoadingSpinner text="Loading abilities..." />
      ) : abilities.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No abilities found.</p>
      ) : (
        <>
          <div className="ability-table">
            <div className="ability-head">
              <button
                className={`ability-head-cell${
                  sortKey === "name" ? " is-active" : ""
                }`}
                onClick={() => toggleSort("name")}
              >
                Name <span className="item-sort-arrow">{arrow("name")}</span>
              </button>
              <span className="ability-head-cell is-static">Pokémon</span>
              <span className="ability-head-cell is-static">Description</span>
              <button
                className={`ability-head-cell${
                  sortKey === "gen" ? " is-active" : ""
                }`}
                onClick={() => toggleSort("gen")}
              >
                Gen. <span className="item-sort-arrow">{arrow("gen")}</span>
              </button>
            </div>

            {abilities.map((a) => (
              <AbilityRow
                key={a.id}
                ability={a}
                open={openAbility === a.name}
                onToggle={() =>
                  setOpenAbility(openAbility === a.name ? null : a.name)
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
