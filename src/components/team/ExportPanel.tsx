import { useState } from "react";
import { toShowdown } from "../../lib/showdown";
import type { TeamMember } from "../../context/TeamsContext";

/** Panel con el equipo en formato Showdown y un botón para copiarlo. */
export function ExportPanel({
  members,
  onClose,
}: {
  members: TeamMember[];
  onClose: () => void;
}) {
  const text = toShowdown(members);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Sin permiso del portapapeles: el texto se puede copiar a mano
    }
  }

  return (
    <div className="relative mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
      <button
        onClick={onClose}
        title="Close"
        className="absolute top-1 right-1 w-[45px] h-[45px] flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-lg cursor-pointer"
      >
        ✕
      </button>
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
        Showdown export
      </p>

      <textarea
        readOnly
        value={text}
        rows={Math.min(24, text.split("\n").length + 1)}
        // Selecciona todo al enfocar, para copiar a mano
        onFocus={(e) => e.currentTarget.select()}
        className="w-full p-3 border border-gray-300 rounded-lg bg-white font-mono text-xs text-gray-700 focus:outline-none focus:border-red-400"
      />

      <div className="flex flex-wrap items-center gap-3 mt-2">
        <button
          onClick={copy}
          className="btn-primary min-h-[45px] sm:min-h-0 px-5 py-1.5 rounded-full text-sm"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <span className="text-xs text-gray-400">
          Paste it in Pokémon Showdown: Teambuilder → Import from text.
        </span>
      </div>
    </div>
  );
}
