const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type Props = {
  letter: string | null;
  onPick: (letter: string | null) => void;
};

// Tira de letras A–Z de Abilities, Items y Moves
export function LetterStrip({ letter, onPick }: Props) {
  return (
    <div className="item-letters">
      <button
        className={`item-letter${letter === null ? " is-active" : ""}`}
        onClick={() => onPick(null)}
      >
        All
      </button>
      {LETTERS.map((L) => (
        <button
          key={L}
          className={`item-letter${letter === L ? " is-active" : ""}`}
          onClick={() => onPick(L)}
        >
          {L}
        </button>
      ))}
    </div>
  );
}