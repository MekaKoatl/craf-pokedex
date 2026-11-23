import type { Move } from "../types/move";

/** Reemplaza el marcador `$effect_chance` que la API deja sin resolver en los textos. */
function fillChance(text: string, chance: number | null): string {
  return text.replace(/\$effect_chance/g, String(chance ?? 0));
}

/** Descripción corta del efecto, en inglés, con la probabilidad ya resuelta. */
export function moveShortEffect(m: Move): string {
  const raw =
    m.effect_entries.find((e) => e.language.name === "en")?.short_effect ?? "";
  return fillChance(raw, m.effect_chance);
}

/**
 * Descripción completa del efecto, en inglés, con la probabilidad resuelta.
 * Conserva los saltos dobles como separación de párrafos.
 */
export function moveEffect(m: Move): string {
  const raw =
    m.effect_entries.find((e) => e.language.name === "en")?.effect ?? "";
  return fillChance(raw, m.effect_chance)
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .join("\n\n")
    .trim();
}

/** Texto de los juegos más reciente, en inglés, en una sola línea. */
export function moveFlavor(m: Move): string {
  const entries = m.flavor_text_entries.filter((e) => e.language.name === "en");
  return entries[entries.length - 1]?.flavor_text.replace(/\f|\n/g, " ") ?? "";
}

/**
 * Los 18 tipos que tienen movimientos. Se excluyen los tipos especiales
 * de la API (unknown, shadow y stellar).
 */
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

/** Categorías de daño de un movimiento. */
export const MOVE_CATEGORIES = ["physical", "special", "status"] as const;
