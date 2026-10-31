// Tabla de tipos actual (Gen VI en adelante).
// Atacante → { 2: le pega doble, 0.5: le pega la mitad, 0: no le hace nada }
const CHART_LISTS: Record<string, { 2?: string[]; 0.5?: string[]; 0?: string[] }> = {
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
  psychic: { 2: ["fighting", "poison"], 0.5: ["psychic", "steel"], 0: ["dark"] },
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
  fairy: { 2: ["fighting", "dragon", "dark"], 0.5: ["fire", "poison", "steel"] },
};

// Las listas pasadas a una tabla: CHART["fire"]["grass"] = 2
const CHART: Record<string, Record<string, number>> = {};
for (const [atk, lists] of Object.entries(CHART_LISTS)) {
  CHART[atk] = {};
  for (const [mult, defs] of Object.entries(lists)) {
    for (const def of defs ?? []) CHART[atk][def] = Number(mult);
  }
}

const ALL_TYPES = Object.keys(CHART_LISTS);

// Los tipos que existen en una generación
export function typesForGen(gen: number): string[] {
  return ALL_TYPES.filter((t) => {
    if (t === "dark" || t === "steel") return gen >= 2;
    if (t === "fairy") return gen >= 6;
    return true;
  });
}

// Cuánto le hace un tipo atacante a un tipo defensor en esa generación
export function effectiveness(atk: string, def: string, gen: number): number {
  // Hasta Gen V, Steel resistía Ghost y Dark
  if (gen < 6 && def === "steel" && (atk === "ghost" || atk === "dark"))
    return 0.5;
  // Las rarezas de Gen I
  if (gen === 1) {
    if (atk === "bug" && def === "poison") return 2;
    if (atk === "poison" && def === "bug") return 2;
    if (atk === "ghost" && def === "psychic") return 0; // el error famoso
    if (atk === "ice" && def === "fire") return 1;
  }
  return CHART[atk]?.[def] ?? 1;
}

// Contra un Pokémon de uno o dos tipos: se multiplican
export function defenseMultiplier(
  atk: string,
  defTypes: string[],
  gen: number,
): number {
  return defTypes.reduce((m, def) => m * effectiveness(atk, def, gen), 1);
}