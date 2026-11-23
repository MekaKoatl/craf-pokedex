import type { TeamMember } from "../context/TeamsContext";
import type { PokemonFull } from "../types/pokemon";
import { GAME_POKEMON } from "../data/pokemon-games";
import { POKEMON_DATA } from "../data/pokemon-data";
import { gameFeatures, type Game } from "./games";
import { abilitiesForGame, itemsForGame, movesForGame } from "./teamRules";
import { getRegionalDisplayName } from "./regional";

/** Índice de entradas del dataset por id. */
const ENTRY_BY_ID = new Map(POKEMON_DATA.map((e) => [e.id, e]));
/** Nombre legible de un Pokémon por id, para los mensajes al usuario. */
const nameOf = (id: number) =>
  getRegionalDisplayName(ENTRY_BY_ID.get(id)?.name ?? `#${id}`);

/**
 * Adapta los miembros de un equipo a otro juego. Quita a los Pokémon que
 * no existen en ese juego y, en el resto, descarta la habilidad, el objeto,
 * la naturaleza y los movimientos que el juego no admite. Los movimientos
 * conservan su casillero; los inválidos quedan vacíos.
 *
 * @param members Miembros del equipo original.
 * @param game Juego de destino.
 * @param getFull Obtiene los datos completos de un Pokémon (desde la caché si ya se pidieron).
 * @returns Los miembros adaptados y un aviso por cada cambio hecho.
 */
export async function transferMembers(
  members: TeamMember[],
  game: Game,
  getFull: (id: number) => Promise<PokemonFull>,
): Promise<{ members: TeamMember[]; notes: string[] }> {
  const features = gameFeatures(game);
  const available = new Set(GAME_POKEMON[game.group] ?? []);
  const items = new Set(Object.values(itemsForGame(game)).flat());

  const out: TeamMember[] = [];
  const notes: string[] = [];

  for (const m of members) {
    const name = nameOf(m.pokemonId);
    if (!available.has(m.pokemonId)) {
      notes.push(`${name} isn't in Pokémon ${game.label}, so it was left out.`);
      continue;
    }

    const p = await getFull(m.pokemonId);

    const ability =
      features.abilities &&
      m.ability &&
      abilitiesForGame(p, game.gen).some((a) => a.name === m.ability)
        ? m.ability
        : null;
    const learnable = new Set(movesForGame(p, game.group));
    const moves = m.moves.map((n) => (n && learnable.has(n) ? n : ""));
    const item = features.items && m.item && items.has(m.item) ? m.item : null;
    const nature = features.natures ? m.nature : null;

    const lost: string[] = [];
    if (m.ability && !ability) lost.push("ability");
    if (m.item && !item) lost.push("item");
    if (m.nature && !nature) lost.push("nature");
    const lostMoves =
      m.moves.filter(Boolean).length - moves.filter(Boolean).length;
    if (lostMoves)
      lost.push(`${lostMoves} ${lostMoves === 1 ? "move" : "moves"}`);
    if (lost.length)
      notes.push(
        `${name}: removed ${lost.join(", ")} (not valid in ${game.label}).`,
      );

    // Nivel, EVs e IVs se copian tal cual; el resto se reemplaza por lo validado
    out.push({ ...m, ability, item, nature, moves });
  }

  return { members: out, notes };
}
