import { useState } from "react";
import { normalize } from "../lib/text";

export type SortDir = "asc" | "desc";

// Estado compartido de las listas de Abilities, Items y Moves:
// búsqueda, letra, orden por columna y fila abierta.
// K son las columnas que se pueden ordenar, p. ej. "name" | "gen".
export function useListControls<K extends string>(
  initialOpen: string | null = null,
) {
  const [search, setSearch] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<K | "default">("default");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [open, setOpen] = useState<string | null>(initialOpen);
  const [resetKey, setResetKey] = useState(0);

  // 1er click asc, 2do desc, 3ro vuelve al orden original
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

  function arrow(key: K) {
    if (sortKey !== key) return "⇅";
    return sortDir === "asc" ? "▲" : "▼";
  }

  // El select de celular manda "columna:dirección", p. ej. "name:desc"
  function pickSort(value: string) {
    const [k, d] = value.split(":");
    setSortKey(k as K | "default");
    setSortDir(d as SortDir);
    setOpen(null);
  }

  function pickLetter(L: string | null) {
    setLetter(letter === L ? null : L);
    setOpen(null);
  }

  function toggleOpen(name: string) {
    setOpen(open === name ? null : name);
  }

  function reset() {
    setSearch("");
    setLetter(null);
    setSortKey("default");
    setSortDir("asc");
    setOpen(null);
    setResetKey((k) => k + 1); // fuerza a SearchBar a reiniciarse
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

// Filtra por búsqueda y letra; si hay comparador, ordena con él
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

// Orden por un dato de otro mapa (tipo, categoría...); empate por nombre.
// "~" va después de cualquier letra: los que no tienen dato quedan al final.
export function byMap(map: Record<string, string>) {
  return (a: string, b: string) =>
    (map[a] ?? "~").localeCompare(map[b] ?? "~") || a.localeCompare(b);
}

export const byName = (a: string, b: string) => a.localeCompare(b);