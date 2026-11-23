import { useState } from "react";
import { normalize } from "../lib/text";

/** Dirección de orden. */
export type SortDir = "asc" | "desc";

/**
 * Estado de las listas de Abilities, Items y Moves: búsqueda, letra inicial,
 * orden por columna y fila abierta.
 *
 * @typeParam K Columnas ordenables, p. ej. `"name" | "gen"`.
 * @param initialOpen Fila abierta al montar (p. ej. la habilidad que llega desde Details).
 */
export function useListControls<K extends string>(
  initialOpen: string | null = null,
) {
  const [search, setSearch] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<K | "default">("default");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [open, setOpen] = useState<string | null>(initialOpen);
  const [resetKey, setResetKey] = useState(0);

  /** Rota el orden de una columna: ascendente → descendente → orden original. */
  function toggleSort(key: K) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey("default");
      setSortDir("asc");
    }
    setOpen(null);
  }

  /** Flecha del encabezado: ⇅ sin orden, ▲ ascendente, ▼ descendente. */
  function arrow(key: K) {
    if (sortKey !== key) return "⇅";
    return sortDir === "asc" ? "▲" : "▼";
  }

  /** Aplica un orden desde el selector de celular, con formato "columna:dirección" (p. ej. "name:desc"). */
  function pickSort(value: string) {
    const [k, d] = value.split(":");
    setSortKey(k as K | "default");
    setSortDir(d as SortDir);
    setOpen(null);
  }

  /** Filtra por letra inicial; elegir la misma letra (o "All") quita el filtro. */
  function pickLetter(L: string | null) {
    setLetter(letter === L ? null : L);
    setOpen(null);
  }

  /** Abre la fila indicada o la cierra si ya estaba abierta. */
  function toggleOpen(name: string) {
    setOpen(open === name ? null : name);
  }

  /** Vuelve todo al estado inicial. */
  function reset() {
    setSearch("");
    setLetter(null);
    setSortKey("default");
    setSortDir("asc");
    setOpen(null);
    setResetKey((k) => k + 1); // usado como `key` de SearchBar para vaciarla
  }

  return {
    q: normalize(search),
    setSearch,
    letter,
    sortKey,
    sortDir,
    open,
    setOpen,
    resetKey,
    toggleSort,
    arrow,
    pickSort,
    pickLetter,
    toggleOpen,
    reset,
  };
}

/**
 * Filtra nombres por texto normalizado y letra inicial; si se pasa `compare`,
 * los ordena con él (invertido si `dir` es "desc"). Sin comparador conserva
 * el orden original.
 */
export function filterAndSort(
  names: string[],
  q: string,
  letter: string | null,
  dir: SortDir,
  compare?: (a: string, b: string) => number,
): string[] {
  let out = names;
  if (q) out = out.filter((n) => normalize(n).includes(q));
  if (letter) out = out.filter((n) => n.charAt(0).toUpperCase() === letter);
  if (compare) {
    out = [...out].sort(compare);
    if (dir === "desc") out.reverse();
  }
  return out;
}

/**
 * Comparador por un valor asociado (tipo, categoría...), con desempate por nombre.
 * Los nombres sin valor en `map` quedan al final.
 */
export function byMap(map: Record<string, string>) {
  return (a: string, b: string) =>
    (map[a] ?? "~").localeCompare(map[b] ?? "~") || a.localeCompare(b);
}

/** Comparador alfabético. */
export const byName = (a: string, b: string) => a.localeCompare(b);
