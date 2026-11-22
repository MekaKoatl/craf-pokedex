import { useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAbilityNames } from "../hooks/useAbilityNames";
import { usePagedList } from "../hooks/usePagedList";
import { useAbilityGenMap } from "../hooks/useAbilityGenMap";
import {
  useListControls,
  filterAndSort,
  byName,
} from "../hooks/useListControls";
import { getAbility } from "../lib/api";
import { SearchBar } from "../components/SearchBar";
import { AbilityRow } from "../components/abilities/AbilityRow";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { LetterStrip } from "../components/lists/LetterStrip";
import { LoadMoreButton } from "../components/LoadMoreButton";

export function Abilities() {
  const [searchParams, setSearchParams] = useSearchParams();
  // La habilidad que llega desde Details, p. ej. /abilities?open=sticky-hold
  const focus = searchParams.get("open");

  const c = useListControls<"name" | "gen">(focus);
  const { setOpen } = c;

  // Si se entra de nuevo con otra habilidad, se abre esa
  useEffect(() => {
    if (focus) setOpen(focus);
  }, [focus, setOpen]);

  const { data: allNames = [] } = useAbilityNames();

  // Solo se pide si hace falta ordenar por generación
  const { data: genMap } = useAbilityGenMap(c.sortKey === "gen");

  const names = useMemo(() => {
    const compare =
      c.sortKey === "name"
        ? byName
        : c.sortKey === "gen" && genMap
          ? // Empate de generación se desempata por nombre
            (a: string, b: string) =>
              (genMap[a] ?? 99) - (genMap[b] ?? 99) || a.localeCompare(b)
          : undefined;
    const out = filterAndSort(allNames, c.q, c.letter, c.sortDir, compare);

    // La que viene de Details se adelanta, así cae en la primera página
    if (focus && out.includes(focus)) {
      return [focus, ...out.filter((n) => n !== focus)];
    }
    return out;
  }, [allNames, c.q, c.letter, c.sortKey, c.sortDir, genMap, focus]);

  // Todo lo que cambia la lista tiene que estar en la clave de caché
  const listKey = `${c.q || "all"}|${c.letter ?? ""}|${c.sortKey}|${c.sortDir}|${
    genMap ? 1 : 0
  }|${focus ?? ""}`;

  // Las que no son de la serie principal vienen de spin-offs
  const list = usePagedList(
    "ability",
    names,
    listKey,
    getAbility,
    (a) => a.is_main_series,
  );

  const abilities = list.data?.pages.flat() ?? [];

  function clearAll() {
    c.reset();
    setSearchParams({}, { replace: true }); // suelta la habilidad fijada
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Abilities</h2>
      </div>

      <SearchBar
        key={c.resetKey}
        onSearch={c.setSearch}
        placeholder="Search Ability by name..."
      />

      <div className="filter-bar items-center">
        {/* En mobile no hay encabezados, el orden se elige acá */}
        <select
          className="item-select sm:hidden"
          value={`${c.sortKey}:${c.sortDir}`}
          onChange={(e) => c.pickSort(e.target.value)}
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

      <LetterStrip letter={c.letter} onPick={c.pickLetter} />

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
                  c.sortKey === "name" ? " is-active" : ""
                }`}
                onClick={() => c.toggleSort("name")}
              >
                Name <span className="item-sort-arrow">{c.arrow("name")}</span>
              </button>
              <span className="ability-head-cell is-static">Pokémon</span>
              <span className="ability-head-cell is-static">Description</span>
              <button
                className={`ability-head-cell${
                  c.sortKey === "gen" ? " is-active" : ""
                }`}
                onClick={() => c.toggleSort("gen")}
              >
                Gen. <span className="item-sort-arrow">{c.arrow("gen")}</span>
              </button>
            </div>

            {abilities.map((a) => (
              <AbilityRow
                key={a.id}
                ability={a}
                open={c.open === a.name}
                onToggle={() => c.toggleOpen(a.name)}
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
