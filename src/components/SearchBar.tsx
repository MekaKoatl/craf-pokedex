import { useState, useEffect } from "react";
import { ClearButton } from "./ClearButton";

export function SearchBar({
  onSearch,
  placeholder = "Search Pokémon by name...",
}: {
  onSearch: (query: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  // Debounce: espera 400ms tras dejar de teclear
  useEffect(() => {
    const t = setTimeout(() => onSearch(value.trim()), 400);
    return () => clearTimeout(t);
  }, [value, onSearch]);

  // Al borrar no hace falta esperar: la lista vuelve al instante
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
        className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full text-gray-700 text-sm focus:outline-none focus:border-red-400"
      />
      <ClearButton show={value !== ""} onClear={clear} />
    </div>
  );
}
