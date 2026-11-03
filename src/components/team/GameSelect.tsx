import { GAMES, GENERATIONS, genLabel } from "../../lib/games";

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
      {/* Un grupo por generación */}
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