import { TEAM_SIZE, type TeamMember } from "../context/TeamsContext";
import { POKEMON_DATA } from "../data/pokemon-data";
import { HELD_ITEMS } from "../data/held-items";
import {
  DEFAULT_IVS,
  DEFAULT_LEVEL,
  EMPTY_EVS,
  itemLabel,
  MAX_EV,
  MAX_IV,
  NATURES,
  STAT_NAMES,
  type StatTuple,
} from "./teamRules";
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

// ── Importar ───────────────────────────────

// Nombre de Showdown → nombre de la API:
// "King's Shield" → "kings-shield", "Mr. Mime" → "mr-mime", "Flabébé" → "flabebe"
const toId = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // saca los acentos
    .toLowerCase()
    .replace(/['’.:%]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const ID_BY_NAME = new Map(POKEMON_DATA.map((e) => [e.name, e.id]));

// El id de pokemon-data para un nombre, o null si no existe
function findSpecies(name: string): number | null {
  const exact = ID_BY_NAME.get(name);
  if (exact) return exact;
  // A veces la API le agrega la forma: "mimikyu" → "mimikyu-disguised",
  // "tauros-paldea-combat" → "tauros-paldea-combat-breed".
  // Si hay varias, gana el id más chico (la forma principal)
  const forms = POKEMON_DATA.filter((e) => e.name.startsWith(`${name}-`)).sort(
    (a, b) => a.id - b.id,
  );
  return forms[0]?.id ?? null;
}

// La Megapiedra de una especie: "charizard" + "x" → "charizardite-x"
function megaStone(species: string, letter?: string): string | null {
  const prefix = species.slice(0, 5);
  return (
    Object.keys(HELD_ITEMS).find(
      (n) =>
        HELD_ITEMS[n][0] === "mega-stones" &&
        n.startsWith(prefix) &&
        (letter ? n.endsWith(`-${letter}`) : !/-[xyz]$/.test(n)),
    ) ?? null
  );
}

// "252 HP / 4 Atk / 252 Spe" → cambia esos stats sobre una base
function parseStats(text: string, base: StatTuple, max: number): StatTuple {
  const out = [...base] as StatTuple;
  for (const part of text.split("/")) {
    const [num, stat] = part.trim().split(/\s+/);
    const i = STAT_NAMES.findIndex(
      (s) => s.toLowerCase() === stat?.toLowerCase(),
    );
    if (i >= 0) out[i] = Math.max(0, Math.min(max, Number(num) || 0));
  }
  return out;
}

// El texto de Showdown → miembros del equipo, más avisos de lo que no se entendió.
// Acá no se revisa el juego: eso lo hace transferMembers después.
export function fromShowdown(text: string): {
  members: TeamMember[];
  notes: string[];
} {
  const members: TeamMember[] = [];
  const notes: string[] = [];

  // Cada Pokémon es un bloque separado por una línea en blanco.
  // Las líneas "=== ... ===" son títulos de equipo y se ignoran.
  const blocks = text
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((b) =>
      b
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("===")),
    )
    .filter((lines) => lines.length > 0);

  for (const lines of blocks) {
    // Primera línea: "Apodo (Especie) (M) @ Objeto". Casi todo es opcional.
    const [left, itemText] = lines[0].split(" @ ");
    const noGender = left.replace(/\s*\((M|F)\)\s*$/, "").trim();
    // Con apodo, la especie va entre paréntesis
    const speciesText = noGender.match(/\(([^)]+)\)\s*$/)?.[1] ?? noGender;
    let species = toId(speciesText);
    let item: string | null = itemText ? toId(itemText) : null;

    // Las Megas se guardan como la especie normal con su Megapiedra
    const mega = species.match(/^(.+)-mega(?:-([xyz]))?$/);
    if (mega) {
      species = mega[1];
      item ??= megaStone(mega[1], mega[2]);
    }
    species = species.replace(/-gmax$/, "");

    const pokemonId = findSpecies(species);
    if (!pokemonId) {
      notes.push(`"${speciesText}" wasn't recognized, so it was left out.`);
      continue;
    }
    if (members.length >= TEAM_SIZE) {
      notes.push(`A team has ${TEAM_SIZE} Pokémon; the rest were left out.`);
      break;
    }

    // Los Cristales Z se guardan como "firium-z--held"
    if (item && !HELD_ITEMS[item] && HELD_ITEMS[`${item}--held`])
      item = `${item}--held`;

    const m: TeamMember = {
      pokemonId,
      ability: null,
      item,
      nature: null,
      moves: [],
      level: 100, // sin "Level:", Showdown usa 100
      evs: [...EMPTY_EVS] as StatTuple,
      ivs: [...DEFAULT_IVS] as StatTuple,
    };

    for (const line of lines.slice(1)) {
      if (line.startsWith("Ability:")) {
        m.ability = toId(line.slice(8));
      } else if (line.startsWith("Level:")) {
        m.level = Math.max(1, Math.min(100, parseInt(line.slice(6)) || 100));
      } else if (line.startsWith("EVs:")) {
        m.evs = parseStats(line.slice(4), EMPTY_EVS, MAX_EV);
      } else if (line.startsWith("IVs:")) {
        m.ivs = parseStats(line.slice(4), DEFAULT_IVS, MAX_IV);
      } else if (line.endsWith(" Nature")) {
        const n = toId(line.replace(/ Nature$/, ""));
        if (NATURES.some((x) => x.name === n)) m.nature = n;
      } else if (/^[-~]/.test(line) && m.moves.length < 4) {
        // "- Hidden Power [Fire]" → "hidden-power"
        m.moves.push(toId(line.slice(1).replace(/\[.*\]/, "")));
      }
      // El resto (Shiny, Tera Type, Happiness...) se ignora
    }

    members.push(m);
  }

  return { members, notes };
}