/**
 * Opción de un filtro de la Pokédex que se activa al tocarla.
 * Las de tipo (`isType`) usan el color de `typeName`; el resto, un color neutro.
 */
export function FilterPill({
  label,
  active,
  isType = false,
  typeName,
  onClick,
}: {
  label: string;
  active: boolean;
  isType?: boolean;
  typeName?: string;
  onClick: () => void;
}) {
  const colorClass = isType ? `pill-type-${typeName}` : "pill-generic";
  return (
    <span
      className={`filter-pill ${colorClass}${active ? " active" : ""}`}
      onClick={onClick}
    >
      {label}
    </span>
  );
}
