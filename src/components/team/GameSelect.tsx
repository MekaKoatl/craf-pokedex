import { GAMES, GENERATIONS, genLabel } from "../../lib/games";

/** Selector de juego con las opciones agrupadas por generación. `value` es el id del juego. */
export function GameSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (gameId: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="item-select"
    >
      <option value="" disabled>
        Choose a game...
      </option>
      {GENERATIONS.map((gen) => (
        <optgroup key={gen} label={genLabel(gen)}>
          {GAMES.filter((g) => g.gen === gen).map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
