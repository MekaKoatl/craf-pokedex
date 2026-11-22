import { useState, type FormEvent } from "react";

type Props = {
  /** Nombre actual; es el valor inicial del campo. */
  initial: string;
  /** Devuelve un mensaje de error si el nombre no es válido, o null si lo es. */
  validate: (name: string) => string | null;
  /** Se llama con el nombre nuevo cuando pasa la validación. */
  onSave: (name: string) => void;
  /** Se llama al tocar "Cancel" o al apretar Escape. */
  onCancel: () => void;
};

/**
 * Formulario en línea para renombrar una lista o un equipo.
 * Maneja su propio borrador y el mensaje de error; se monta al entrar
 * en modo edición, así que siempre arranca con el nombre actual.
 */
export function RenameForm({ initial, validate, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validate(draft);
    if (err) {
      setError(err);
      return;
    }
    onSave(draft);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-wrap gap-2">
      <input
        autoFocus
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
        maxLength={40}
        className="w-full sm:w-auto sm:flex-1 min-w-0 px-3 h-[45px] sm:h-auto py-1.5 border border-gray-300 rounded-lg text-xl font-bold text-gray-900 focus:outline-none focus:border-red-400"
      />
      <button
        type="submit"
        className="min-h-[45px] sm:min-h-0 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition cursor-pointer"
      >
        Save
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="min-h-[45px] sm:min-h-0 px-2 text-sm font-semibold text-gray-400 hover:text-gray-600 cursor-pointer"
      >
        Cancel
      </button>
      {error && <p className="w-full text-xs text-red-500">{error}</p>}
    </form>
  );
}
