import type { Item } from "../types/item";

export { prettyName } from "./text";

export function itemShortEffect(item: Item): string {
  return (
    item.effect_entries.find((e) => e.language.name === "en")?.short_effect ??
    ""
  );
}

export function itemEffect(item: Item): string {
  const raw =
    item.effect_entries.find((e) => e.language.name === "en")?.effect ?? "";
  // La API mete saltos de línea en mitad de las frases; conservamos
  // solo los dobles, que sí separan párrafos de verdad
  return raw
    .replace(/\n:\s*/g, ": ")
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .join("\n\n")
    .trim();
}

// El más reciente en inglés
export function itemFlavor(item: Item): string {
  const entries = item.flavor_text_entries.filter(
    (e) => e.language.name === "en",
  );
  return entries[entries.length - 1]?.text.replace(/\f|\n/g, " ") ?? "";
}

// En qué generación apareció, según el primer game_index
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

export function genLabel(generationName: string): string {
  return GEN_ROMAN[generationName] ?? "";
}
