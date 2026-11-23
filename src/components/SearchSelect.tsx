import { useEffect, useRef, useState } from "react";

/** Opción de `SearchSelect`. */
export interface SearchOption {
  value: string;
  label: string;
}
/** Grupo de opciones de `SearchSelect`. */
export interface SearchGroup {
  /** Título del grupo; sin título no se dibuja encabezado. */
  label?: string;
  options: SearchOption[];
}

const inputClass =
  "w-full pl-3 pr-10 h-[45px] sm:h-auto py-2 border border-gray-300 rounded-lg text-base sm:text-sm text-gray-700 bg-white focus:outline-none focus:border-red-400 disabled:bg-gray-50";
/**
 * Selector con búsqueda: al enfocarlo se escribe para filtrar las opciones,
 * agrupadas y con títulos fijos al hacer scroll. `value` null es sin selección.
 */
export function SearchSelect({
  value,
  groups,
  onChange,
  placeholder = "Search...",
  disabled = false,
}: {
  value: string | null;
  groups: SearchGroup[];
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel =
    groups.flatMap((g) => g.options).find((o) => o.value === value)?.label ??
    "";

  // Cierra al hacer clic afuera
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Opciones que coinciden con la búsqueda; se omiten los grupos vacíos
  const q = query.trim().toLowerCase();
  const filtered = groups
    .map((g) => ({
      ...g,
      options: g.options.filter((o) => o.label.toLowerCase().includes(q)),
    }))
    .filter((g) => g.options.length > 0);
  const first = filtered[0]?.options[0];

  function pick(v: string | null) {
    onChange(v);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={ref} className="relative">
      <input
        // Abierto muestra la búsqueda; cerrado, la opción elegida
        value={open ? query : selectedLabel}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "Enter" && first) {
            e.preventDefault();
            pick(first.value);
          }
        }}
        placeholder={selectedLabel || placeholder}
        disabled={disabled}
        className={inputClass}
      />

      {value && !disabled && (
        <button
          type="button"
          onClick={() => pick(null)}
          title="Clear"
          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer after:absolute after:-inset-[7px]"
        >
          ✕
        </button>
      )}

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-30 text-sm">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-gray-400">No results.</p>
          ) : (
            filtered.map((g, gi) => (
              <div key={g.label ?? gi}>
                {g.label && (
                  // sticky: el título queda fijo arriba al hacer scroll
                  <p className="sticky top-0 bg-gray-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    {g.label}
                  </p>
                )}
                {g.options.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => pick(o.value)}
                    className={`block w-full text-left px-3 py-3.5 sm:py-1.5 hover:bg-red-50 cursor-pointer ${
                      o.value === value
                        ? "font-semibold text-red-600"
                        : "text-gray-700"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
