import type { Item } from "../types/item";

export { prettyName } from "./text";

/** Descripción corta del efecto, en inglés. */
export function itemShortEffect(item: Item): string {
  return (
    item.effect_entries.find((e) => e.language.name === "en")?.short_effect ??
    ""
  );
}

/**
 * Descripción completa del efecto, en inglés. Une los saltos de línea
 * simples que deja la API y conserva los dobles como separación de párrafos.
 */
export function itemEffect(item: Item): string {
  const raw =
    item.effect_entries.find((e) => e.language.name === "en")?.effect ?? "";
  return raw
    .replace(/\n:\s*/g, ": ")
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .join("\n\n")
    .trim();
}

/** Texto de los juegos más reciente, en inglés, en una sola línea. */
export function itemFlavor(item: Item): string {
  const entries = item.flavor_text_entries.filter(
    (e) => e.language.name === "en",
  );
  return entries[entries.length - 1]?.text.replace(/\f|\n/g, " ") ?? "";
}

/** Generación en la que apareció el objeto, según su primer `game_index`. */
export function itemGeneration(item: Item): string {
  return item.game_indices[0]?.generation.name ?? "";
}

const GEN_ROMAN: Record<string, string> = {
  "generation-i": "Gen I",
  "generation-ii": "Gen II",
  "generation-iii": "Gen III",
  "generation-iv": "Gen IV",
  "generation-v": "Gen V",
  "generation-vi": "Gen VI",
  "generation-vii": "Gen VII",
  "generation-viii": "Gen VIII",
  "generation-ix": "Gen IX",
};

/** Etiqueta corta de una generación de la API: "generation-iv" → "Gen IV". */
export function genLabel(generationName: string): string {
  return GEN_ROMAN[generationName] ?? "";
}
