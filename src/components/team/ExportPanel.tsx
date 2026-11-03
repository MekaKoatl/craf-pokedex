import { useState } from "react";
import { toShowdown } from "../../lib/showdown";
import type { TeamMember } from "../../context/TeamsContext";

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
      // Vuelve a decir "Copy" después de un momento
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Si el navegador no deja copiar, el texto igual se puede seleccionar a mano
    }
  }

  return (
    <div className="relative mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
      <button
        onClick={onClose}
        title="Close"
        className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
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
        // Al hacer click se selecciona todo, por si se quiere copiar a mano
        onFocus={(e) => e.currentTarget.select()}
        className="w-full p-3 border border-gray-300 rounded-lg bg-white font-mono text-xs text-gray-700 focus:outline-none focus:border-red-400"
      />

      <div className="flex flex-wrap items-center gap-3 mt-2">
        <button
          onClick={copy}
          className="px-5 py-1.5 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition cursor-pointer"
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