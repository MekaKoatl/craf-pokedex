import type { Ability } from "../types/ability";

export function abilityShortEffect(a: Ability): string {
  return (
    a.effect_entries.find((e) => e.language.name === "en")?.short_effect ?? ""
  );
}

export function abilityEffect(a: Ability): string {
  const raw = a.effect_entries.find((e) => e.language.name === "en")?.effect ?? "";
  return raw
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .join("\n\n")
    .trim();
}

// El más reciente en inglés
export function abilityFlavor(a: Ability): string {
  const entries = a.flavor_text_entries.filter((e) => e.language.name === "en");
  return entries[entries.length - 1]?.flavor_text.replace(/\f|\n/g, " ") ?? "";
}


export { idFromUrl } from "./text";