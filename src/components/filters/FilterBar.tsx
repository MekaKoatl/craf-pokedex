import { FilterPanel } from "./FilterPanel";
import type { FilterState } from "../../hooks/useFilters";

const TYPES = [
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];
const REGIONS = [
  "Kanto",
  "Johto",
  "Hoenn",
  "Sinnoh",
  "Unova",
  "Kalos",
  "Alola",
  "Galar",
  "Paldea",
];
const GENS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const EVOS = [
  { value: 1, label: "No evolutions" },
  { value: 2, label: "2 in chain" },
  { value: 3, label: "3 in chain" },
];
const FORMS = [
  { value: "M", label: "Mega" },
  { value: "G", label: "Gigantamax" },
  { value: "R", label: "Regional" },
  { value: "Legend", label: "Legendary" },
  { value: "Mythic", label: "Mythical" },
  { value: "Baby", label: "Baby" },
];

interface FilterBarProps {
  filters: FilterState;
  toggle: <K extends keyof FilterState>(
    group: K,
    value: FilterState[K][number],
  ) => void;
  clearGroup: <K extends keyof FilterState>(group: K) => void;
  clearAll: () => void;
  showEvoAndForms?: boolean; // DXG los muestra; Home y Favoritos no
}

export function FilterBar({
  filters,
  toggle,
  clearGroup,
  clearAll,
  showEvoAndForms = false,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <FilterPanel
        label="Type"
        isType
        options={TYPES.map((t) => ({ value: t, label: t }))}
        activeValues={filters.types}
        onToggle={(v) => toggle("types", v as string)}
        onClear={() => clearGroup("types")}
      />
      <FilterPanel
        label="Region"
        options={REGIONS.map((r) => ({ value: r.toLowerCase(), label: r }))}
        activeValues={filters.regions}
        onToggle={(v) => toggle("regions", v as string)}
        onClear={() => clearGroup("regions")}
      />
      <FilterPanel
        label="Generation"
        options={GENS.map((g) => ({ value: g, label: `Gen ${g}` }))}
        activeValues={filters.gens}
        onToggle={(v) => toggle("gens", v as number)}
        onClear={() => clearGroup("gens")}
      />

      {showEvoAndForms && (
        <>
          <FilterPanel
            label="Evolutions"
            options={EVOS}
            activeValues={filters.evos}
            onToggle={(v) => toggle("evos", v as number)}
            onClear={() => clearGroup("evos")}
          />
          <FilterPanel
            label="Forms"
            options={FORMS}
            activeValues={filters.forms}
            onToggle={(v) => toggle("forms", v as string)}
            onClear={() => clearGroup("forms")}
          />
        </>
      )}

      <button className="filter-dropdown-btn" onClick={clearAll}>
        Clear all
      </button>
    </div>
  );
}
