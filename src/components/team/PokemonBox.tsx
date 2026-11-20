import { useState, type RefObject } from "react";
import { POKEMON_DATA } from "../../data/pokemon-data";
import { GAME_POKEMON } from "../../data/pokemon-games";
import { REGIONAL_DEX } from "../../data/regional-dex";
import { POKEMON_STATS } from "../../data/pokemon-stats";
import {
  genLabel,
  spriteStyle,
  teamIconUrl,
  usesArtwork,
  type Game,
} from "../../lib/games";
import { defenseMultiplier, typesForGen } from "../../lib/typeChart";
import { getRegionalDisplayName } from "../../lib/regional";
import { compareDex, dexNumber } from "../../lib/dexOrder";
import { FilterPanel } from "../filters/FilterPanel";
import { ClearButton } from "../ClearButton";
import { TypeBadge } from "../badges/TypeBadge";
import { useTeamDefense } from "../../hooks/useTeamDefense";
import type { TeamMember } from "../../context/TeamsContext";

// Región de origen → generación (las de Hisui son de Gen VIII)
const REGION_GEN: Record<string, number> = {
  kanto: 1,
  johto: 2,
  hoenn: 3,
  sinnoh: 4,
  unova: 5,
  kalos: 6,
  alola: 7,
  galar: 8,
  hisui: 8,
  paldea: 9,
};

// 3 filas de casilleros de 64px + 2 espacios de 6px
const COLLAPSED_HEIGHT = 204;

// Agrega o quita un valor de una lista
function toggleIn<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

// Cómo ordenar la caja. Los stats van de mayor a menor.
type SortKey = "dex" | "total" | "hp" | "atk" | "def" | "spa" | "spd" | "spe";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "dex", label: "Sort: Pokédex" },
  { key: "total", label: "Sort: Total" },
  { key: "hp", label: "Sort: HP" },
  { key: "atk", label: "Sort: Attack" },
  { key: "def", label: "Sort: Defense" },
  { key: "spa", label: "Sort: Sp. Atk" },
  { key: "spd", label: "Sort: Sp. Def" },
  { key: "spe", label: "Sort: Speed" },
];

// Posición de cada stat en el array de pokemon-stats.ts
const STAT_INDEX: Record<string, number> = {
  hp: 0,
  atk: 1,
  def: 2,
  spa: 3,
  spd: 4,
  spe: 5,
};

// El valor por el que se ordena, o null si ese Pokémon no tiene datos
function statValue(id: number, key: SortKey): number | null {
  const stats = POKEMON_STATS[id];
  if (!stats) return null;
  if (key === "total") return stats.reduce((a, b) => a + b, 0);
  return stats[STAT_INDEX[key]] ?? null;
}

// Botón que se prende y apaga, mismo estilo que Defense / Offense
function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[45px] sm:min-h-0 px-3 py-1 rounded-lg text-xs font-semibold border-2 transition cursor-pointer ${
        active
          ? "bg-red-600 border-red-600 text-white"
          : "border-gray-300 text-gray-500 hover:border-red-400"
      }`}
    >
      {children}
    </button>
  );
}

export function PokemonBox({
  game,
  members,
  full,
  onAdd,
  inputRef,
}: {
  game: Game;
  members: TeamMember[];
  full: boolean;
  onAdd: (pokemonId: number) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const [search, setSearch] = useState("");
  const [dex, setDex] = useState<"all" | "regional">("all");
  const [types, setTypes] = useState<string[]>([]);
  const [gens, setGens] = useState<number[]>([]);
  const [finalOnly, setFinalOnly] = useState(false);
  const [hideTeam, setHideTeam] = useState(false);
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("dex");
  const [coverOnly, setCoverOnly] = useState(false);

  // Los tipos donde el equipo da negativo en el Team Analysis.
  // null mientras cargan los datos del equipo.
  const defense = useTeamDefense(members, game);
  const weakTypes = defense
    ? defense.filter((d) => d.total < 0).map((d) => d.type)
    : null;
  // Cuántos de esos tipos resiste (o anula) un Pokémon, con sus tipos de hoy
  const coverCount = (types: string[]) =>
    (weakTypes ?? []).filter(
      (atk) => defenseMultiplier(atk, types, game.gen) < 1,
    ).length;
  // El filtro solo actúa si está prendido y hay debilidades para cubrir
  const covering = coverOnly && !!weakTypes && weakTypes.length > 0;

  const available = new Set(GAME_POKEMON[game.group] ?? []);
  const regional = new Set(REGIONAL_DEX[game.group] ?? []);
  // Posición de cada especie en la Pokédex del juego, para ordenar la caja
  const dexOrder = new Map(
    (REGIONAL_DEX[game.group] ?? []).map((id, i) => [id, i]),
  );
  const art = usesArtwork(game);
  const inTeam = new Set(members.map((m) => m.pokemonId));
  const q = search.trim().toLowerCase();

  const box = POKEMON_DATA.filter((e) => {
    if (!available.has(e.id)) return false;
    // La Pokédex regional guarda especies: Alolan Rattata cuenta como #19
    if (dex === "regional" && !regional.has(dexNumber(e.id))) return false;
    if (finalOnly && !e.isFinal) return false;
    if (hideTeam && inTeam.has(e.id)) return false;
    if (types.length && !types.some((t) => e.types.includes(t))) return false;
    if (gens.length && !gens.includes(REGION_GEN[e.region] ?? 0)) return false;
    if (covering && coverCount(e.types) === 0) return false;
    if (
      q &&
      !e.name.includes(q) &&
      !getRegionalDisplayName(e.name).toLowerCase().includes(q)
    )
      return false;
    return true;
  }).sort((a, b) => {
    // Por stat: de mayor a menor (los que no tienen datos, al final)
    if (sortKey !== "dex") {
      const diff =
        (statValue(b.id, sortKey) ?? -1) - (statValue(a.id, sortKey) ?? -1);
      if (diff) return diff;
    } else if (covering) {
      // Cubriendo debilidades: primero los que cubren más tipos
      const diff = coverCount(b.types) - coverCount(a.types);
      if (diff) return diff;
    }
    // Primero los de la Pokédex del juego, en su orden;
    // después el resto, por número nacional
    const ia = dexOrder.get(dexNumber(a.id)) ?? Infinity;
    const ib = dexOrder.get(dexNumber(b.id)) ?? Infinity;
    return ia - ib || compareDex(a.id, b.id);
  });

  const anyFilter =
    dex !== "all" ||
    types.length > 0 ||
    gens.length > 0 ||
    finalOnly ||
    hideTeam ||
    coverOnly ||
    q !== "";

  function clearFilters() {
    setSearch("");
    setDex("all");
    setTypes([]);
    setGens([]);
    setFinalOnly(false);
    setHideTeam(false);
    setCoverOnly(false);
    setSortKey("dex");
  }

  // Solo hasta la generación del juego
  const genOptions = Array.from({ length: game.gen }, (_, i) => ({
    value: i + 1,
    label: genLabel(i + 1),
  }));

  const panelProps = (name: string) => ({
    isOpen: openPanel === name,
    onOpen: () => setOpenPanel(name),
    onClose: () => setOpenPanel(null),
  });

  return (
    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">
        Available Pokémon ({box.length})
      </h3>

      <div className="relative mb-3">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setSearch("")}
          placeholder={
            full
              ? "The team is full. Remove a Pokémon to add another."
              : `Search a Pokémon from ${game.label}...`
          }
          className="w-full pl-4 pr-10 h-[45px] sm:h-auto py-2 border border-gray-300 rounded-full text-gray-700 text-base sm:text-sm bg-white focus:outline-none focus:border-red-400"
        />
        <ClearButton show={search !== ""} onClear={() => setSearch("")} />
      </div>

      {/* Filtros */}
      <div className="relative flex flex-wrap items-center gap-2 mb-4">
        <Toggle active={dex === "all"} onClick={() => setDex("all")}>
          All available
        </Toggle>
        <Toggle active={dex === "regional"} onClick={() => setDex("regional")}>
          Regional Pokédex
        </Toggle>

        <FilterPanel
          label="Type"
          isType
          options={typesForGen(game.gen).map((t) => ({ value: t, label: t }))}
          activeValues={types}
          onToggle={(v) => setTypes((prev) => toggleIn(prev, v as string))}
          onClear={() => setTypes([])}
          {...panelProps("type")}
        />
        <FilterPanel
          label="Generation"
          options={genOptions}
          activeValues={gens}
          onToggle={(v) => setGens((prev) => toggleIn(prev, v as number))}
          onClear={() => setGens([])}
          {...panelProps("gen")}
        />

        <Toggle active={finalOnly} onClick={() => setFinalOnly((v) => !v)}>
          Final evolutions
        </Toggle>
        <Toggle active={hideTeam} onClick={() => setHideTeam((v) => !v)}>
          Hide team
        </Toggle>
        {/* Solo tiene sentido con al menos un Pokémon en el equipo */}
        {members.length > 0 && (
          <Toggle active={coverOnly} onClick={() => setCoverOnly((v) => !v)}>
            Covers weaknesses
          </Toggle>
        )}

        {/* Orden de la caja */}
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="item-select"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>

        {anyFilter && (
          <button
            type="button"
            onClick={clearFilters}
            className="min-h-[45px] sm:min-h-0 text-xs font-semibold text-gray-400 hover:text-red-500 underline cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Con "Covers weaknesses": qué tipos se están cubriendo */}
      {coverOnly && members.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4 text-xs text-gray-500 [&_.type-badge]:flex-none">
          {!weakTypes ? (
            "Loading team..."
          ) : weakTypes.length === 0 ? (
            "Your team has no weaknesses to cover."
          ) : (
            <>
              <span>Showing Pokémon that resist:</span>
              {weakTypes.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
              <span>(most covered first)</span>
            </>
          )}
        </div>
      )}

      {/* La caja: click agrega al equipo */}
      {box.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          No Pokémon match these filters.
        </p>
      ) : (
        <>
          <div
            // Cerrada, se corta a 3 filas
            style={expanded ? undefined : { maxHeight: COLLAPSED_HEIGHT }}
            className={`grid grid-cols-[repeat(auto-fill,64px)] justify-between gap-1.5 overflow-hidden ${
              full ? "opacity-40" : ""
            }`}
          >
            {box.map((e) => (
              <button
                key={e.id}
                onClick={() => onAdd(e.id)}
                disabled={full}
                title={`#${dexNumber(e.id)} ${getRegionalDisplayName(e.name)}`}
                className="relative flex items-center justify-center w-16 h-16 rounded-lg bg-white border border-gray-200 hover:border-red-300 transition cursor-pointer disabled:cursor-not-allowed disabled:hover:border-gray-200"
              >
                <img
                  src={teamIconUrl(e.id, game)}
                  alt={e.name}
                  loading="lazy"
                  className={`${art ? "w-11 h-11" : "w-12 h-12"} object-contain`}
                  style={spriteStyle(!art)}
                />
                {/* Con un stat elegido, su valor abajo a la derecha */}
                {sortKey !== "dex" && (
                  <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-gray-500 tabular-nums">
                    {statValue(e.id, sortKey) ?? "—"}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="min-h-[45px] sm:min-h-0 w-full mt-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600 border-t border-gray-200 cursor-pointer"
          >
            {expanded ? "Show less ▲" : `Show all (${box.length}) ▼`}
          </button>
        </>
      )}
    </div>
  );
}
