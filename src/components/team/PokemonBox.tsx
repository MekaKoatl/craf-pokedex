import { useState, type RefObject } from "react";
import { POKEMON_DATA } from "../../data/pokemon-data";
import { GAME_POKEMON } from "../../data/pokemon-games";
import { REGIONAL_DEX } from "../../data/regional-dex";
import {
  genLabel,
  spriteStyle,
  teamIconUrl,
  usesArtwork,
  type Game,
} from "../../lib/games";
import { typesForGen } from "../../lib/typeChart";
import { getRegionalDisplayName } from "../../lib/regional";
import { compareDex, dexNumber } from "../../lib/dexOrder";
import { FilterPanel } from "../filters/FilterPanel";
import { ClearButton } from "../ClearButton";
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
      className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition cursor-pointer ${
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
    if (
      q &&
      !e.name.includes(q) &&
      !getRegionalDisplayName(e.name).toLowerCase().includes(q)
    )
      return false;
    return true;
  }).sort((a, b) => {
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
    q !== "";

  function clearFilters() {
    setSearch("");
    setDex("all");
    setTypes([]);
    setGens([]);
    setFinalOnly(false);
    setHideTeam(false);
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
    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
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
          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full text-gray-700 text-sm bg-white focus:outline-none focus:border-red-400"
        />
        <ClearButton show={search !== ""} onClear={() => setSearch("")} />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
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

        {anyFilter && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-gray-400 hover:text-red-500 underline cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

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
                className="flex items-center justify-center w-16 h-16 rounded-lg bg-white border border-gray-200 hover:border-red-300 transition cursor-pointer disabled:cursor-not-allowed disabled:hover:border-gray-200"
              >
                <img
                  src={teamIconUrl(e.id, game)}
                  alt={e.name}
                  loading="lazy"
                  className={`${art ? "w-11 h-11" : "w-12 h-12"} object-contain`}
                  style={spriteStyle(!art)}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full mt-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600 border-t border-gray-200 cursor-pointer"
          >
            {expanded ? "Show less ▲" : `Show all (${box.length}) ▼`}
          </button>
        </>
      )}
    </div>
  );
}
