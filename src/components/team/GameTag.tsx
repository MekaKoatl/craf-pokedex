import { gameColor, type Game } from "../../lib/games";

// Pastilla con el nombre del juego, en el color de su portada
export function GameTag({ game }: { game: Game }) {
  const c = gameColor(game);
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap border"
      style={{ background: c.bg, color: c.fg, borderColor: c.border ?? c.bg }}
    >
      {game.label}
    </span>
  );
}