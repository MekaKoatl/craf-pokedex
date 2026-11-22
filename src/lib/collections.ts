/** Órdenes comunes a las colecciones del usuario (listas y equipos). */
export type CollectionSort = "oldest" | "newest" | "az" | "za";

export const COLLECTION_SORT_LABELS: Record<CollectionSort, string> = {
  oldest: "Oldest first",
  newest: "Newest first",
  az: "Name A–Z",
  za: "Name Z–A",
};

/**
 * Ordena una colección. El array de entrada ya está en orden de creación,
 * por lo que "oldest" lo devuelve tal cual y "newest" lo invierte.
 * Cualquier otra clave usa `custom`, si se pasa.
 *
 * @param items Elementos en orden de creación.
 * @param sort Clave de orden elegida.
 * @param custom Comparador para órdenes propios de cada página (p. ej. por juego).
 */
export function sortCollection<T extends { name: string }>(
  items: T[],
  sort: string,
  custom?: (a: T, b: T) => number,
): T[] {
  switch (sort) {
    case "oldest":
      return items;
    case "newest":
      return [...items].reverse();
    case "az":
      return [...items].sort((a, b) => a.name.localeCompare(b.name));
    case "za":
      return [...items].sort((a, b) => b.name.localeCompare(a.name));
    default:
      return custom ? [...items].sort(custom) : items;
  }
}
