/** Pastilla con el nombre de un tipo, coloreada con la clase `type-{tipo}` de `index.css`. */
export function TypeBadge({ type }: { type: string }) {
  return <span className={`type-badge type-${type}`}>{type}</span>;
}
