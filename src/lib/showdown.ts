import type { TeamMember } from "../context/TeamsContext";
import { POKEMON_DATA } from "../data/pokemon-data";
import { DEFAULT_LEVEL, itemLabel, STAT_NAMES } from "./teamRules";
import { prettyName } from "./text";

const ENTRY_BY_ID = new Map(POKEMON_DATA.map((e) => [e.id, e]));

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Showdown separa las formas con guion: "Raichu-Alola", "Tauros-Paldea-Combat"
function speciesName(id: number): string {
  const name = ENTRY_BY_ID.get(id)?.name ?? String(id);
  return name
    .replace(/-(breed|standard)$/, "") // nombres de la API que Showdown no usa
    .split("-")
    .map(cap)
    .join("-");
}

// El equipo en el formato de texto de Pokémon Showdown.
// Solo se escribe lo que está elegido.
export function toShowdown(members: TeamMember[]): string {
  return members
    .map((m) => {
      const lines = [
        `${speciesName(m.pokemonId)}${m.item ? ` @ ${itemLabel(m.item)}` : ""}`,
      ];
      if (m.ability) lines.push(`Ability: ${prettyName(m.ability)}`);
      // Showdown asume nivel 100: solo se escribe si es otro
      const level = m.level ?? DEFAULT_LEVEL;
      if (level !== 100) lines.push(`Level: ${level}`);
      // "EVs: 252 Atk / 4 Def / 252 Spe" (solo los que no son 0)
      const evs = (m.evs ?? [])
        .map((v, i) => (v ? `${v} ${STAT_NAMES[i]}` : ""))
        .filter(Boolean);
      if (evs.length) lines.push(`EVs: ${evs.join(" / ")}`);
      if (m.nature) lines.push(`${prettyName(m.nature)} Nature`);
      // "IVs: 0 Atk" (solo los que no son 31)
      const ivs = (m.ivs ?? [])
        .map((v, i) => (v !== 31 ? `${v} ${STAT_NAMES[i]}` : ""))
        .filter(Boolean);
      if (ivs.length) lines.push(`IVs: ${ivs.join(" / ")}`);
      for (const move of m.moves) if (move) lines.push(`- ${prettyName(move)}`);
      return lines.join("\n");
    })
    .join("\n\n"); // una línea en blanco entre Pokémon
}
