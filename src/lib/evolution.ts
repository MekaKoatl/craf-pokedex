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

export function buildLinearPath(chain: EvoNode, target: string) {
  const path: { name: string; nextDetail: EvoDetail | null }[] = [];
  function find(node: EvoNode): boolean {
    path.push({ name: node.species.name, nextDetail: null });
    if (node.species.name === target) return true;
    for (const child of node.evolves_to) {
      path[path.length - 1].nextDetail = child.evolution_details[0] ?? null;
      if (find(child)) return true;
    }
    path.pop();
    return false;
  }
  find(chain);
  return path;
}

export function getChildren(chain: EvoNode, name: string): EvoNode[] {
  function find(node: EvoNode): EvoNode[] | null {
    if (node.species.name === name) return node.evolves_to;
    for (const child of node.evolves_to) {
      const r = find(child);
      if (r) return r;
    }
    return null;
  }
  return find(chain) ?? [];
}

// Recorre los descendientes nivel por nivel: hijos, nietos, bisnietos...
// Devuelve un array por nivel, sin importar cuántos haya en cada uno.
export function getDescendantLevels(chain: EvoNode, name: string): EvoNode[][] {
  const levels: EvoNode[][] = [];
  let current = getChildren(chain, name);
  while (current.length > 0) {
    levels.push(current);
    current = current.flatMap((n) => n.evolves_to);
  }
  return levels;
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

  return out.length > 0 ? out : ["Special method"];
}

export interface EvoTransition {
  from: string;
  to: string;
  ways: string[][]; // cada vía alternativa, con sus condiciones
}

// Todos los pasos de la cadena, con todas sus vías
export function listTransitions(chain: EvoNode): EvoTransition[] {
  const out: EvoTransition[] = [];
  function walk(node: EvoNode) {
    for (const child of node.evolves_to) {
      out.push({
        from: node.species.name,
        to: child.species.name,
        ways: child.evolution_details.map(describeEvolution),
      });
      walk(child);
    }
  }
  walk(chain);
  return out;
}
