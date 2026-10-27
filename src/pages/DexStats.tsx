import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { POKEMON_DATA } from "../data/pokemon-data";
import { POKEMON_STATS } from "../data/pokemon-stats";
import { filterPokemonData } from "../lib/filterPokemon";
import { iconOrSprite } from "../lib/sprites";
import { getRegionalDisplayName } from "../lib/regional";
import { normalize } from "../lib/text";
import { useFilters } from "../hooks/useFilters";
import { FilterBar } from "../components/filters/FilterBar";
import { SearchBar } from "../components/SearchBar";
import { SpriteImg } from "../components/SpriteImg";
import { TypeBadge } from "../components/badges/TypeBadge";

const PAGE = 50;

// Mismo orden que el array de pokemon-stats.ts
const STAT_COLS = [
  { key: "hp", label: "HP" },
  { key: "atk", label: "Attack" },
  { key: "def", label: "Defense" },
  { key: "spa", label: "Sp. Atk" },
  { key: "spd", label: "Sp. Def" },
  { key: "spe", label: "Speed" },
] as const;

type StatKey = (typeof STAT_COLS)[number]["key"];
type SortKey = "dex" | "name" | "total" | StatKey;

interface Row {
  id: number;
  dex: number; // número de Pokédex (las regionales usan el de su especie)
  name: string;
  display: string;
  types: string[];
  regional: boolean;
  stats: readonly number[];
  total: number;
}

const DEX_BY_NAME = new Map(POKEMON_DATA.map((e) => [e.name, e.id]));

// Se arma una sola vez al cargar el archivo: los datos no cambian
const ALL_ROWS: Row[] = POKEMON_DATA.flatMap((e) => {
  const stats = POKEMON_STATS[e.id];
  if (!stats) return [];
  // "raticate-alola" → "raticate", para buscar su número
  const base = e.isRegional ? e.name.slice(0, e.name.lastIndexOf("-")) : e.name;
  return [
    {
      id: e.id,
      dex: DEX_BY_NAME.get(base) ?? e.id,
      name: e.name,
      display: getRegionalDisplayName(e.name),
      types: e.types,
      regional: Boolean(e.isRegional),
      stats,
      total: stats.reduce((a, b) => a + b, 0),
    },
  ];
});

function sortValue(r: Row, key: Exclude<SortKey, "name">): number {
  if (key === "dex") return r.dex;
  if (key === "total") return r.total;
  return r.stats[STAT_COLS.findIndex((c) => c.key === key)];
}

export function DexStats() {
  const { filters, toggle, clearGroup, clearAll } = useFilters();
  const [search, setSearch] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("dex");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState({ key: "", count: PAGE });

  const q = normalize(search);

  const rows = useMemo(() => {
    const allowed = new Set(filterPokemonData(filters).map((e) => e.id));
    const dir = sortDir === "asc" ? 1 : -1;

    return ALL_ROWS.filter(
      (r) =>
        allowed.has(r.id) &&
        (!q ||
          normalize(r.display).includes(q) ||
          normalize(r.name).includes(q)),
    ).sort((a, b) => {
      const main =
        sortKey === "name"
          ? a.display.localeCompare(b.display)
          : sortValue(a, sortKey) - sortValue(b, sortKey);
      // El desempate va siempre por número, sin importar la dirección
      return (
        dir * main || a.dex - b.dex || Number(a.regional) - Number(b.regional)
      );
    });
  }, [filters, q, sortKey, sortDir]);

  // Si cambia cualquier cosa que afecte la lista, se vuelve a 50 filas
  const listKey = `${JSON.stringify(filters)}|${q}|${sortKey}|${sortDir}`;
  const count = page.key === listKey ? page.count : PAGE;
  const visible = rows.slice(0, count);

  // Cambiar de columna: nombre y # arrancan A→Z, los stats de mayor a menor
  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "dex" || key === "name" ? "asc" : "desc");
    }
  }

  function arrow(key: SortKey) {
    if (sortKey !== key) return "⇅";
    return sortDir === "asc" ? "▲" : "▼";
  }

  function clearEverything() {
    clearAll();
    setSearch("");
    setResetKey((k) => k + 1);
    setSortKey("dex");
    setSortDir("asc");
  }

  const th = (key: SortKey, label: string, right = false) => (
    <th key={key} className={`py-2 px-3 ${right ? "text-right" : "text-left"}`}>
      <button
        onClick={() => toggleSort(key)}
        className={`inline-flex items-center gap-1 uppercase tracking-wide cursor-pointer transition ${
          sortKey === key ? "text-red-500" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        {label} <span className="item-sort-arrow">{arrow(key)}</span>
      </button>
    </th>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Pokédex by Stats
      </h2>

      <SearchBar
        key={resetKey}
        onSearch={setSearch}
        placeholder="Search Pokémon by name..."
      />
      <FilterBar
        filters={filters}
        toggle={toggle}
        clearGroup={clearGroup}
        clearAll={clearEverything}
        showEvoAndForms
      />

      <p className="text-xs text-gray-400 mb-2">{rows.length} Pokémon</p>

      {rows.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No Pokémon found.</p>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-gray-100 text-[11px] font-bold">
                <tr>
                  {th("dex", "#")}
                  {th("name", "Name")}
                  <th className="py-2 px-3 text-left uppercase tracking-wide text-gray-400">
                    Type
                  </th>
                  {th("total", "Total", true)}
                  {STAT_COLS.map((c) => th(c.key, c.label, true))}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-1.5 px-3">
                      <div className="flex items-center gap-2">
                        <SpriteImg
                          src={iconOrSprite(r.id)}
                          alt=""
                          loading="lazy"
                          className="w-10 h-10 object-contain"
                          style={{ imageRendering: "pixelated" }}
                        />
                        <span className="text-gray-500 tabular-nums">
                          {String(r.dex).padStart(4, "0")}
                        </span>
                      </div>
                    </td>
                    <td className="py-1.5 px-3">
                      <Link
                        to={`/details/${r.id}`}
                        className="font-semibold text-gray-900 hover:text-red-600 transition"
                      >
                        {r.display}
                      </Link>
                    </td>
                    <td className="py-1.5 px-3">
                      <div className="flex flex-col items-start gap-1 [&_.type-badge]:w-[60px]">
                        {r.types.map((t) => (
                          <TypeBadge key={t} type={t} />
                        ))}
                      </div>
                    </td>
                    <td className="py-1.5 px-3 text-right font-bold text-gray-900 tabular-nums">
                      {r.total}
                    </td>
                    {r.stats.map((s, i) => (
                      <td
                        key={STAT_COLS[i].key}
                        className="py-1.5 px-3 text-right text-gray-700 tabular-nums"
                      >
                        {s}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {count < rows.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setPage({ key: listKey, count: count + PAGE })}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition cursor-pointer"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
