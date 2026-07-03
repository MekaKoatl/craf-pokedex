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
