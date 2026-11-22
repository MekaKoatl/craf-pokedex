import { useState } from "react";

/**
 * Modo selección de una colección (listas o equipos): qué ids están
 * marcados y las acciones para marcar, desmarcar y borrar en lote.
 *
 * @param ids Ids de los elementos visibles; "Select all" actúa solo sobre ellos.
 */
export function useSelection(ids: string[]) {
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const allSelected =
    ids.length > 0 && ids.every((id) => selected.includes(id));

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  /** Marca todos los visibles o, si ya estaban todos, los desmarca. */
  function toggleAll() {
    setSelected((prev) =>
      allSelected
        ? prev.filter((x) => !ids.includes(x))
        : [...new Set([...prev, ...ids])],
    );
  }

  function start() {
    setSelecting(true);
  }

  function stop() {
    setSelecting(false);
    setSelected([]);
  }

  /**
   * Pide confirmación, borra los marcados y sale del modo selección.
   *
   * @param remove Función que borra un elemento por id.
   * @param noun Sustantivo en singular y plural para el mensaje, p. ej. ["list", "lists"].
   */
  function deleteSelected(
    remove: (id: string) => void,
    [one, many]: [string, string],
  ) {
    const n = selected.length;
    if (!confirm(`Delete ${n} ${n === 1 ? one : many}?`)) return;
    selected.forEach(remove);
    stop();
  }

  return {
    selecting,
    selected,
    allSelected,
    toggle,
    toggleAll,
    start,
    stop,
    deleteSelected,
  };
}

export type Selection = ReturnType<typeof useSelection>;