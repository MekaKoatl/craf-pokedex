import type { Move } from "../types/move";

// La API deja el marcador sin resolver: "Has a $effect_chance% chance to…"
function fillChance(text: string, chance: number | null): string {
  return text.replace(/\$effect_chance/g, String(chance ?? 0));
}

export function moveShortEffect(m: Move): string {
  const raw =
    m.effect_entries.find((e) => e.language.name === "en")?.short_effect ?? "";
  return fillChance(raw, m.effect_chance);
}

export function moveEffect(m: Move): string {
  const raw =
    m.effect_entries.find((e) => e.language.name === "en")?.effect ?? "";
  return fillChance(raw, m.effect_chance)
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .join("\n\n")
    .trim();
}

// El más reciente en inglés
export function moveFlavor(m: Move): string {
  const entries = m.flavor_text_entries.filter((e) => e.language.name === "en");
  return entries[entries.length - 1]?.flavor_text.replace(/\f|\n/g, " ") ?? "";
}

// Los 18 tipos con movimientos. La API también expone unknown,
// shadow y stellar, que no aportan nada acá.
export const MOVE_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export const MOVE_CATEGORIES = ["physical", "special", "status"] as const;
