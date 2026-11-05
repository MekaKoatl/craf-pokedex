import { useState } from "react";
import { POKEMON_DATA } from "../data/pokemon-data";
import { getRegionalDisplayName } from "../lib/regional";
import { iconOrSprite } from "../lib/sprites";
import { compareDex, dexNumber } from "../lib/dexOrder";
import { SpriteImg } from "./SpriteImg";
import { ClearButton } from "./ClearButton";

// Cuántos resultados muestra
const MAX_RESULTS = 8;

// Buscador para agregar Pokémon: click agrega, otro click quita
export function AddPokemonSearch({
  isAdded,
  onToggle,
  placeholder,
}: {
  isAdded: (id: number) => boolean;
  onToggle: (id: number) => void;
  placeholder: string;
}) {
  const [search, setSearch] = useState("");

  // Por nombre interno o por nombre visible ("alolan")
  const q = search.trim().toLowerCase();
  const matches = q
    ? POKEMON_DATA.filter(
        (e) =>
          e.name.includes(q) ||
          getRegionalDisplayName(e.name).toLowerCase().includes(q),
      )
        .sort((a, b) => compareDex(a.id, b.id))
        .slice(0, MAX_RESULTS)
    : [];

  return (
    <div className="relative">
      {/* Input con el + a la izquierda y la ✕ a la derecha */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 text-lg font-bold leading-none pointer-events-none">
          +
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setSearch("")}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-full bg-white text-gray-700 text-sm focus:outline-none focus:border-red-400"
        />
        <ClearButton show={search !== ""} onClear={() => setSearch("")} />
      </div>

      {q && (
        <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          {matches.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-400">
              No Pokémon found.
            </li>
          ) : (
            matches.map((e) => {
              const added = isAdded(e.id);
              return (
                <li key={e.id}>
                  <button
                    onClick={() => onToggle(e.id)}
                    className="w-full flex items-center gap-3 px-3 py-1 text-left hover:bg-gray-50 transition cursor-pointer"
                  >
                    <SpriteImg
                      src={iconOrSprite(e.id)}
                      alt=""
                      className="w-10 h-10 object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <span className="w-12 text-xs text-gray-400">
                      #{dexNumber(e.id)}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-gray-800">
                      {getRegionalDisplayName(e.name)}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        added ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {added ? "✓ Added" : "+ Add"}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
