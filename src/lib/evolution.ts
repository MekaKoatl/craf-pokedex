import type { EvoNode, EvoDetail } from "../types/pokemon";

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

// Los triggers que no son "subir de nivel" vienen con nombres crudos
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

function pretty(s: string): string {
  return s.replace(/-/g, " ");
}

// Una vía de evolución puede tener varias condiciones a la vez.
// Devuelve todas, no solo la primera como getEvoCondition.
export function describeEvolution(d: EvoDetail): string[] {
  const out: string[] = [];
  const trigger = d.trigger?.name ?? "";

  if (d.min_level) out.push(`Reach level ${d.min_level}`);
  else if (trigger === "level-up") out.push("Level up");

  // "use-item" se omite porque el item de abajo ya lo dice
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
// La API dice qué forma evoluciona (base_form) y en cuál termina
// (evolved_form). Con eso se separan las líneas regionales.

const REGIONAL_RE = /-(alola|galar|hisui|paldea)(?=-|$)/;

// null = la forma normal de la especie. Solo distinguimos regionales,
// así "meowth" y null significan lo mismo.
export function formKey(name: string | null | undefined): string | null {
  return name && REGIONAL_RE.test(name) ? name : null;
}

export interface FormStep {
  species: string;
  form: string | null;
  details: EvoDetail[]; // cómo se llega a este paso desde `from`
  from: FormStep | null;
}

const baseOf = (d: EvoDetail) => formKey(d.required_pokemon_form?.name);
const resultOf = (d: EvoDetail) => formKey(d.evolved_pokemon_form?.name);
// Una vía vale solo para la forma que pide.
// Si no pide una forma regional, es de la forma normal.
const appliesTo = (d: EvoDetail, form: string | null) => baseOf(d) === form;

// Los nodos desde la raíz hasta la especie buscada
function speciesPath(chain: EvoNode, target: string): EvoNode[] {
  if (chain.species.name === target) return [chain];
  for (const child of chain.evolves_to) {
    const p = speciesPath(child, target);
    if (p.length) return [chain, ...p];
  }
  return [];
}

function findNode(chain: EvoNode, name: string): EvoNode | null {
  const p = speciesPath(chain, name);
  return p[p.length - 1] ?? null;
}

// Del primero de la cadena hasta el actual, siguiendo solo su forma
export function buildFormPath(
  chain: EvoNode,
  species: string,
  form: string | null,
): FormStep[] {
  const nodes = speciesPath(chain, species);
  const out: Omit<FormStep, "from">[] = [];
  let cur = form;

  // Se recorre de atrás para adelante: cada paso dice de qué forma vino
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (i === 0) {
      out.unshift({ species: nodes[i].species.name, form: cur, details: [] });
      break;
    }
    const all = nodes[i].evolution_details;
    // 1) Las vías que terminan justo en esta forma
    let ds = all.filter((d) => resultOf(d) === cur);
    // 2) Si la API no lo dice, las que salen de la misma región
    const region = cur?.match(REGIONAL_RE)?.[0];
    if (!ds.length && region)
      ds = all.filter((d) => d.required_pokemon_form?.name.includes(region));
    // 3) Último recurso: todas
    if (!ds.length) ds = all;

    const parent = ds.length ? baseOf(ds[0]) : null;
    ds = ds.filter((d) => baseOf(d) === parent);
    out.unshift({ species: nodes[i].species.name, form: cur, details: ds });
    cur = parent;
  }

  // Se enlaza cada paso con el anterior
  const steps: FormStep[] = [];
  for (const s of out)
    steps.push({ ...s, from: steps[steps.length - 1] ?? null });
  return steps;
}

// Los descendientes de una forma, nivel por nivel.
// Una misma especie puede aparecer dos veces si termina en dos formas
// (Pikachu → Raichu y Raichu de Alola).
export function getFormLevels(chain: EvoNode, start: FormStep): FormStep[][] {
  const levels: FormStep[][] = [];
  let current = [start];

  while (current.length) {
    const next: FormStep[] = [];
    for (const parent of current) {
      const node = findNode(chain, parent.species);
      for (const child of node?.evolves_to ?? []) {
        // Se agrupan las vías por la forma en la que terminan
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
