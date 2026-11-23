/** Convierte un nombre de la API en texto legible: "master-ball" → "Master Ball". */
export function prettyName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Normaliza un texto para comparar búsquedas: minúsculas y sin
 * espacios, guiones ni símbolos ("Master Ball" y "master-ball" → "masterball").
 */
export function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Extrae el id numérico del final de una URL de la API: ".../pokemon/592/" → 592. */
export function idFromUrl(url: string): number {
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
}
