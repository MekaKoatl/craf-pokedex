// Piezas compartidas por las filas abiertas de Abilities, Items y Moves

/** Botón ✕ de cierre, en la esquina superior derecha de la fila abierta. */
export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Close"
      className="absolute top-1 right-1 w-[45px] h-[45px] flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-lg cursor-pointer"
    >
      ✕
    </button>
  );
}

/** Texto de los juegos (como cita) y efecto completo; cada uno solo si existe. */
export function FlavorAndEffect({
  flavor,
  effect,
}: {
  flavor?: string;
  effect?: string;
}) {
  return (
    <>
      {flavor && (
        <blockquote className="mt-4 border-l-4 border-red-400 pl-3 text-sm italic text-gray-500">
          {flavor}
        </blockquote>
      )}
      {effect && (
        <div className="mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">
            Effect
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {effect}
          </p>
        </div>
      )}
    </>
  );
}

/** Dato suelto de la grilla de `InfoCells`. */
export type InfoCell = { label: string; value: string };

/** Grilla de datos sueltos (Power, Fling Power, Target...). No se muestra si está vacía. */
export function InfoCells({ cells }: { cells: InfoCell[] }) {
  if (cells.length === 0) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
      {cells.map((c) => (
        <div
          key={c.label}
          className="bg-white border border-gray-200 rounded-lg p-3"
        >
          <h4 className="text-[0.65rem] font-bold uppercase tracking-wide text-gray-400 mb-1">
            {c.label}
          </h4>
          <p className="text-xs text-gray-700">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
