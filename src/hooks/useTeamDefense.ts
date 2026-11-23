import { useTeamForms } from "./useTeamForms";
import { typesForGame } from "../lib/teamRules";
import {
  abilityMultiplier,
  defenseMultiplier,
  typesForGen,
} from "../lib/typeChart";
import type { Game } from "../lib/games";
import type { TeamMember } from "../context/TeamsContext";

/** Resumen defensivo del equipo contra un tipo atacante. */
export interface DefenseRow {
  /** Tipo atacante. */
  type: string;
  /** Miembros que reciben daño aumentado. */
  weak: number;
  /** Miembros que reciben daño reducido o nulo. */
  resist: number;
  /** Suma de puntajes de `defenseScore`; negativo indica debilidad del equipo. */
  total: number;
}

/** Puntaje de un multiplicador: ×4 → −2, ×2 → −1, ×½ → +1, ×¼ o inmune → +2, neutro → 0. */
function defenseScore(v: number): number {
  if (v >= 4) return -2;
  if (v > 1) return -1;
  if (v === 0 || v <= 0.25) return 2;
  if (v < 1) return 1;
  return 0;
}

/**
 * Defensa del equipo contra cada tipo del juego, considerando tipos y
 * habilidad de cada miembro (o de su forma Mega). La usan Team Analysis y
 * el filtro "Covers weaknesses" de la caja.
 *
 * @returns Una fila por tipo, o null mientras cargan los datos de los miembros.
 */
export function useTeamDefense(
  members: TeamMember[],
  game: Game,
): DefenseRow[] | null {
  const forms = useTeamForms(members);

  // Se analiza la forma Mega si la tiene; si no, la normal
  const pokes = forms.map((f) => f.mega ?? f.base);
  if (pokes.some((p) => !p)) return null;

  // La Mega tiene una única habilidad fija; si no, se usa la elegida
  const abilities = forms.map((f, i) =>
    f.mega ? (f.mega.abilities[0]?.ability.name ?? null) : members[i].ability,
  );
  const gen = game.gen;
  const memberTypes = pokes.map((p) => (p ? typesForGame(p, gen) : []));

  return typesForGen(gen).map((atk) => {
    // Multiplicador por tipos, ajustado por la habilidad
    const mults = memberTypes.map((ts, i) =>
      abilityMultiplier(
        atk,
        defenseMultiplier(atk, ts, gen),
        abilities[i],
        gen,
      ),
    );
    return {
      type: atk,
      weak: mults.filter((v) => v > 1).length,
      resist: mults.filter((v) => v < 1).length,
      total: mults.reduce((sum, v) => sum + defenseScore(v), 0),
    };
  });
}
