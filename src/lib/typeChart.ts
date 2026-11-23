/**
 * Tabla de tipos vigente (Gen VI en adelante), como listas por atacante:
 * a qué tipos hace daño doble (2), la mitad (0.5) o ninguno (0).
 */
const CHART_LISTS: Record<
  string,
  { 2?: string[]; 0.5?: string[]; 0?: string[] }
> = {
  normal: { 0.5: ["rock", "steel"], 0: ["ghost"] },
  fire: {
    2: ["grass", "ice", "bug", "steel"],
    0.5: ["fire", "water", "rock", "dragon"],
  },
  water: { 2: ["fire", "ground", "rock"], 0.5: ["water", "grass", "dragon"] },
  electric: {
    2: ["water", "flying"],
    0.5: ["electric", "grass", "dragon"],
    0: ["ground"],
  },
  grass: {
    2: ["water", "ground", "rock"],
    0.5: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"],
  },
  ice: {
    2: ["grass", "ground", "flying", "dragon"],
    0.5: ["fire", "water", "ice", "steel"],
  },
  fighting: {
    2: ["normal", "ice", "rock", "dark", "steel"],
    0.5: ["poison", "flying", "psychic", "bug", "fairy"],
    0: ["ghost"],
  },
  poison: {
    2: ["grass", "fairy"],
    0.5: ["poison", "ground", "rock", "ghost"],
    0: ["steel"],
  },
  ground: {
    2: ["fire", "electric", "poison", "rock", "steel"],
    0.5: ["grass", "bug"],
    0: ["flying"],
  },
  flying: {
    2: ["grass", "fighting", "bug"],
    0.5: ["electric", "rock", "steel"],
  },
  psychic: {
    2: ["fighting", "poison"],
    0.5: ["psychic", "steel"],
    0: ["dark"],
  },
  bug: {
    2: ["grass", "psychic", "dark"],
    0.5: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"],
  },
  rock: {
    2: ["fire", "ice", "flying", "bug"],
    0.5: ["fighting", "ground", "steel"],
  },
  ghost: { 2: ["psychic", "ghost"], 0.5: ["dark"], 0: ["normal"] },
  dragon: { 2: ["dragon"], 0.5: ["steel"], 0: ["fairy"] },
  dark: { 2: ["psychic", "ghost"], 0.5: ["fighting", "dark", "fairy"] },
  steel: {
    2: ["ice", "rock", "fairy"],
    0.5: ["fire", "water", "electric", "steel"],
  },
  fairy: {
    2: ["fighting", "dragon", "dark"],
    0.5: ["fire", "poison", "steel"],
  },
};

/** La misma tabla indexada por atacante y defensor: `CHART["fire"]["grass"] === 2`. */
const CHART: Record<string, Record<string, number>> = {};
for (const [atk, lists] of Object.entries(CHART_LISTS)) {
  CHART[atk] = {};
  for (const [mult, defs] of Object.entries(lists)) {
    for (const def of defs ?? []) CHART[atk][def] = Number(mult);
  }
}

const ALL_TYPES = Object.keys(CHART_LISTS);

/** Tipos que existen en una generación (Dark y Steel desde la II, Fairy desde la VI). */
export function typesForGen(gen: number): string[] {
  return ALL_TYPES.filter((t) => {
    if (t === "dark" || t === "steel") return gen >= 2;
    if (t === "fairy") return gen >= 6;
    return true;
  });
}

/**
 * Multiplicador de un tipo atacante contra un tipo defensor en una generación.
 * Incluye las diferencias de la Gen I y de las Gen II a V.
 */
export function effectiveness(atk: string, def: string, gen: number): number {
  // Gen II–V: Steel resistía Ghost y Dark
  if (gen < 6 && def === "steel" && (atk === "ghost" || atk === "dark"))
    return 0.5;
  // Diferencias de la Gen I
  if (gen === 1) {
    if (atk === "bug" && def === "poison") return 2;
    if (atk === "poison" && def === "bug") return 2;
    if (atk === "ghost" && def === "psychic") return 0; // error del juego original
    if (atk === "ice" && def === "fire") return 1;
  }
  return CHART[atk]?.[def] ?? 1;
}

/** Multiplicador contra un Pokémon de uno o dos tipos (producto de ambos). */
export function defenseMultiplier(
  atk: string,
  defTypes: string[],
  gen: number,
): number {
  return defTypes.reduce((m, def) => m * effectiveness(atk, def, gen), 1);
}

// ── Habilidades que modifican el daño recibido ──────────────

/** Habilidades que anulan por completo el daño de ciertos tipos. */
const ABILITY_IMMUNE: Record<string, string[]> = {
  levitate: ["ground"],
  "earth-eater": ["ground"],
  "flash-fire": ["fire"],
  "well-baked-body": ["fire"],
  "volt-absorb": ["electric"],
  "motor-drive": ["electric"],
  "lightning-rod": ["electric"],
  "water-absorb": ["water"],
  "storm-drain": ["water"],
  "dry-skin": ["water"],
  "sap-sipper": ["grass"],
};

/** Habilidades que antes de la Gen V solo atraían el ataque, sin dar inmunidad. */
const IMMUNE_SINCE_GEN5 = new Set(["lightning-rod", "storm-drain"]);

/** Habilidades que reducen a la mitad el daño de ciertos tipos. */
const ABILITY_HALVE: Record<string, string[]> = {
  "thick-fat": ["fire", "ice"],
  heatproof: ["fire"],
  "water-bubble": ["fire"],
  "purifying-salt": ["ghost"],
};

/**
 * Ajusta un multiplicador de daño según la habilidad del defensor.
 *
 * @param atk Tipo del ataque.
 * @param mult Multiplicador por tipos, sin habilidad.
 * @param ability Habilidad del defensor, o null.
 * @param gen Generación del juego.
 */
export function abilityMultiplier(
  atk: string,
  mult: number,
  ability: string | null,
  gen: number,
): number {
  if (!ability) return mult;
  // Wonder Guard: solo recibe daño súper efectivo
  if (ability === "wonder-guard") return mult > 1 ? mult : 0;
  if (
    ABILITY_IMMUNE[ability]?.includes(atk) &&
    !(IMMUNE_SINCE_GEN5.has(ability) && gen < 5)
  )
    return 0;
  if (ABILITY_HALVE[ability]?.includes(atk)) return mult / 2;
  if (ability === "dry-skin" && atk === "fire") return mult * 1.25;
  return mult;
}
