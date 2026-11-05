// La ✕ para borrar un buscador. Va dentro de un contenedor "relative"
// junto al input, y el input necesita pr-10 para que el texto no la tape.
export function ClearButton({
  show,
  onClear,
}: {
  show: boolean; // solo se ve si hay algo escrito
  onClear: () => void;
}) {
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={onClear}
      // Evita que el input pierda el foco: se puede seguir escribiendo
      onMouseDown={(e) => e.preventDefault()}
      title="Clear"
      aria-label="Clear search"
      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
    >
      ✕
    </button>
  );
}
