import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const cardBase = "border rounded-xl p-4 transition";

type Props = {
  /** Ruta a la que lleva la tarjeta fuera del modo selección. */
  to: string;
  selecting: boolean;
  selected: boolean;
  onToggle: () => void;
  children: ReactNode;
};

/**
 * Tarjeta de una lista o un equipo. Fuera del modo selección es un link;
 * dentro, un botón que se marca o desmarca y muestra una casilla.
 */
export function SelectableCard({
  to,
  selecting,
  selected,
  onToggle,
  children,
}: Props) {
  if (!selecting) {
    return (
      <Link
        to={to}
        className={`${cardBase} bg-gray-50 border-gray-200 hover:border-red-300 hover:bg-white`}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`${cardBase} relative text-left cursor-pointer ${
        selected
          ? "bg-red-50 border-red-400"
          : "bg-gray-50 border-gray-200 hover:border-red-300"
      }`}
    >
      <span
        className={`absolute top-3 right-3 w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs font-bold ${
          selected
            ? "bg-red-600 border-red-600 text-white"
            : "bg-white border-gray-300"
        }`}
      >
        {selected && "✓"}
      </span>
      {children}
    </button>
  );
}
