import type { EvoNode, EvoDetail } from "../types/pokemon";

/** Condición principal de una evolución en texto corto ("Lvl 16", "thunder stone"...), o "" si no hay. */
export function getEvoCondition(d: EvoDetail | undefined): string {
  if (!d) return "";
  if (d.min_level) return `Lvl ${d.min_level}`;
  if (d.item) return d.item.name.replace(/-/g, " ");
  if (d.held_item) return d.held_item.name.replace(/-/g, " ");
  if (d.known_move) return `Know: ${d.known_move.name.replace(/-/g, " ")}`;
  if (d.min_happiness) return `Happiness ${d.min_happiness}`;
  if (d.time_of_day) return d.time_of_day;
  if (d.trigger?.name) return d.trigger.name.replace(/-/g, " ");
  return "";
}

/** Texto visible de los métodos de evolución distintos de subir de nivel. */
const TRIGGER_LABELS: Record<string, string> = {
  trade: "Trade",
  shed: "Empty slot in the party and a spare Poké Ball",
  spin: "Spin around holding the Sweet",
  "tower-of-darkness": "Train in the Tower of Darkness",
  "tower-of-waters": "Train in the Tower of Waters",
  "three-critical-hits": "Land 3 critical hits in one battle",
  "take-damage": "Take damage in a specific spot",
  "agile-style-move": "Use an Agile Style move 20 times",
  "strong-style-move": "Use a Strong Style move 20 times",
  "recoil-damage": "Take enough recoil damage",
  other: "Special method",
};

/** Reemplaza guiones por espacios. */
function pretty(s: string): string {
  return s.replace(/-/g, " ");
}

/** Todas las condiciones de una vía de evolución, en texto (a diferencia de `getEvoCondition`, que devuelve solo la principal). */
export function describeEvolution(d: EvoDetail): string[] {
  const out: string[] = [];
  const trigger = d.trigger?.name ?? "";

  if (d.min_level) out.push(`Reach level ${d.min_level}`);
  else if (trigger === "level-up") out.push("Level up");

  // "use-item" se omite: el objeto ya aparece como condición
  if (trigger && trigger !== "level-up" && trigger !== "use-item") {
    out.push(TRIGGER_LABELS[trigger] ?? pretty(trigger));
  }

  if (d.item) out.push(`Use ${pretty(d.item.name)}`);
  if (d.held_item) out.push(`Holding ${pretty(d.held_item.name)}`);
  if (d.known_move) out.push(`Knowing ${pretty(d.known_move.name)}`);
  if (d.known_move_type)
    out.push(`Knowing a ${pretty(d.known_move_type.name)}-type move`);
  if (d.min_happiness) out.push(`Happiness ${d.min_happiness} or more`);
  if (d.min_affection) out.push(`Affection ${d.min_affection} or more`);
  if (d.min_beauty) out.push(`Beauty ${d.min_beauty} or more`);
  if (d.time_of_day) out.push(`During the ${d.time_of_day}`);
  if (d.location) out.push(`At ${pretty(d.location.name)}`);
  if (d.gender === 1) out.push("Female only");
  if (d.gender === 2) out.push("Male only");
  if (d.needs_overworld_rain) out.push("While it is raining");
  if (d.party_species)
    out.push(`With ${pretty(d.party_species.name)} in the party`);
  if (d.party_type)
    out.push(`With a ${pretty(d.party_type.name)}-type in the party`);
  if (d.trade_species)
    out.push(`In exchange for ${pretty(d.trade_species.name)}`);
  if (d.relative_physical_stats === 1) out.push("Attack higher than Defense");
  if (d.relative_physical_stats === 0) out.push("Attack equal to Defense");
  if (d.relative_physical_stats === -1) out.push("Defense higher than Attack");
  if (d.turn_upside_down) out.push("With the console turned upside down");
  if (d.region)
    out.push(
      `In ${d.region.name.charAt(0).toUpperCase()}${d.region.name.slice(1)}`,
    );

  return out.length > 0 ? out : ["Special method"];
}

// ── Cadena por formas ─────────────────────────────────
// La API indica qué forma evoluciona (required_pokemon_form) y en cuál
// termina (evolved_pokemon_form). Con eso se separan las líneas regionales.

/** Detecta un sufijo regional dentro de un nombre de forma. */
const REGIONAL_RE = /-(alola|galar|hisui|paldea)(?=-|$)/;

/**
 * Clave de forma para comparar líneas evolutivas: el nombre si es una forma
 * regional, o null para la forma normal ("meowth" y null son equivalentes).
 */
export function formKey(name: string | null | undefined): string | null {
  return name && REGIONAL_RE.test(name) ? name : null;
}

/** Un paso de la cadena evolutiva siguiendo una forma concreta. */
export interface FormStep {
  species: string;
  form: string | null;
  /** Vías para llegar a este paso desde `from`. */
  details: EvoDetail[];
  from: FormStep | null;
}

const baseOf = (d: EvoDetail) => formKey(d.required_pokemon_form?.name);
const resultOf = (d: EvoDetail) => formKey(d.evolved_pokemon_form?.name);
// Una vía aplica solo a la forma que requiere (null = forma normal)
const appliesTo = (d: EvoDetail, form: string | null) => baseOf(d) === form;

/** Nodos desde la raíz de la cadena hasta la especie buscada (vacío si no está). */
function speciesPath(chain: EvoNode, target: string): EvoNode[] {
  if (chain.species.name === target) return [chain];
  for (const child of chain.evolves_to) {
    const p = speciesPath(child, target);
    if (p.length) return [chain, ...p];
  }
  return [];
}

/** Nodo de una especie dentro de la cadena, o null. */
function findNode(chain: EvoNode, name: string): EvoNode | null {
  const p = speciesPath(chain, name);
  return p[p.length - 1] ?? null;
}

/**
 * Camino evolutivo desde el inicio de la cadena hasta una especie y forma,
 * siguiendo solo las vías de esa forma (p. ej. la línea de Alola).
 */
export function buildFormPath(
  chain: EvoNode,
  species: string,
  form: string | null,
): FormStep[] {
  const nodes = speciesPath(chain, species);
  const out: Omit<FormStep, "from">[] = [];
  let cur = form;

  // Se recorre desde el final: cada paso indica de qué forma proviene
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (i === 0) {
      out.unshift({ species: nodes[i].species.name, form: cur, details: [] });
      break;
    }
    const all = nodes[i].evolution_details;
    // 1) Las vías que terminan justo en esta forma
    let ds = all.filter((d) => resultOf(d) === cur);
    // 2) Si la API no lo indica, las que salen de la misma región
    const region = cur?.match(REGIONAL_RE)?.[0];
    if (!ds.length && region)
      ds = all.filter((d) => d.required_pokemon_form?.name.includes(region));
    // 3) Si tampoco, todas
    if (!ds.length) ds = all;

    const parent = ds.length ? baseOf(ds[0]) : null;
    ds = ds.filter((d) => baseOf(d) === parent);
    out.unshift({ species: nodes[i].species.name, form: cur, details: ds });
    cur = parent;
  }

  // Enlaza cada paso con el anterior
  const steps: FormStep[] = [];
  for (const s of out)
    steps.push({ ...s, from: steps[steps.length - 1] ?? null });
  return steps;
}

/**
 * Descendientes de una forma, agrupados por etapa. Una especie puede
 * aparecer dos veces si evoluciona en dos formas (Pikachu → Raichu y Alolan Raichu).
 */
export function getFormLevels(chain: EvoNode, start: FormStep): FormStep[][] {
  const levels: FormStep[][] = [];
  let current = [start];

  while (current.length) {
    const next: FormStep[] = [];
    for (const parent of current) {
      const node = findNode(chain, parent.species);
      for (const child of node?.evolves_to ?? []) {
        // Agrupa las vías por la forma resultante
        const groups = new Map<string, EvoDetail[]>();
        for (const d of child.evolution_details) {
          if (!appliesTo(d, parent.form)) continue;
          const key = resultOf(d) ?? "";
          groups.set(key, [...(groups.get(key) ?? []), d]);
        }
        for (const [key, ds] of groups) {
          next.push({
            species: child.species.name,
            form: key || null,
            details: ds,
            from: parent,
          });
        }
      }
    }
    if (next.length) levels.push(next);
    current = next;
  }
  return levels;
}
