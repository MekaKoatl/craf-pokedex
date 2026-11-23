import { useState, useEffect } from "react";
import { ClearButton } from "./ClearButton";

/**
 * Campo de búsqueda con debounce: llama a `onSearch` 400ms después de la
 * última tecla. Vaciarlo (✕ o Escape) notifica de inmediato.
 * Para reiniciarlo desde afuera, cambiar su `key`.
 */
export function SearchBar({
  onSearch,
  placeholder = "Search Pokémon by name...",
}: {
  onSearch: (query: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const t = setTimeout(() => onSearch(value.trim()), 400);
    return () => clearTimeout(t);
  }, [value, onSearch]);

  function clear() {
    setValue("");
    onSearch("");
  }

  return (
    <div className="relative mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && clear()}
        placeholder={placeholder}
        className="w-full pl-4 pr-10 h-[45px] sm:h-auto py-2 border border-gray-300 rounded-full text-gray-700 text-base sm:text-sm focus:outline-none focus:border-red-400"
      />
      <ClearButton show={value !== ""} onClear={clear} />
    </div>
  );
}
