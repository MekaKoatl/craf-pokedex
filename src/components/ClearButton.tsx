/**
 * Botón ✕ para vaciar un campo de búsqueda. Se posiciona dentro de un
 * contenedor `relative` junto al input, que necesita `pr-10` para que el
 * texto no quede debajo del botón.
 */
export function ClearButton({
  show,
  onClear,
}: {
  /** Se muestra solo cuando hay texto. */
  show: boolean;
  onClear: () => void;
}) {
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={onClear}
      // Evita que el input pierda el foco al tocar el botón
      onMouseDown={(e) => e.preventDefault()}
      title="Clear"
      aria-label="Clear search"
      // after: amplía el área táctil a 46px manteniendo el tamaño visible de 24px
      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer after:absolute after:-inset-[11px]"
    >
      ✕
    </button>
  );
}
