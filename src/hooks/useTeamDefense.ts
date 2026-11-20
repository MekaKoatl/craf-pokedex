import { useTeamForms } from "./useTeamForms";
import { typesForGame } from "../lib/teamRules";
import {
  abilityMultiplier,
  defenseMultiplier,
  typesForGen,
} from "../lib/typeChart";
import type { Game } from "../lib/games";
import type { TeamMember } from "../context/TeamsContext";

export interface DefenseRow {
  type: string; // el tipo atacante
  weak: number; // cuántos miembros reciben más daño
  resist: number; // cuántos reciben menos (o nada)
  total: number; // la suma de puntos: negativo = el equipo sufre
}

// Cuánto suma o resta cada multiplicador al total de defensa
function defenseScore(v: number): number {
  if (v >= 4) return -2;
  if (v > 1) return -1;
  if (v === 0 || v <= 0.25) return 2;
  if (v < 1) return 1;
  return 0;
}

// La defensa del equipo contra cada tipo del juego.
// La usan el Team Analysis y el filtro "Covers weaknesses" de la caja.
// null mientras cargan los datos de los miembros.
export function useTeamDefense(
  members: TeamMember[],
  game: Game,
): DefenseRow[] | null {
  const forms = useTeamForms(members);

  // La forma que pelea: la Mega si la tiene, si no la normal
  const pokes = forms.map((f) => f.mega ?? f.base);
  if (pokes.some((p) => !p)) return null;

  // La Mega tiene una sola habilidad fija; si no, la elegida
  const abilities = forms.map((f, i) =>
    f.mega ? (f.mega.abilities[0]?.ability.name ?? null) : members[i].ability,
  );
  const gen = game.gen;
  const memberTypes = pokes.map((p) => (p ? typesForGame(p, gen) : []));

  // ×2 resta 1, ×4 resta 2; ×½ suma 1, ×¼ e inmunidad suman 2
  return typesForGen(gen).map((atk) => {
    // Tipos primero, después la habilidad elegida (si hay)
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