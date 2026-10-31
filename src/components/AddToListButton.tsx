import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { useFavorites } from "../hooks/useFavorites";
import { useLists } from "../hooks/useLists";

// Alto aproximado: si no entra abajo del botón, se abre hacia arriba
const MENU_MAX_HEIGHT = 320;

// Dónde se dibuja el menú. null = cerrado
type Pos = { left: number; top?: number; bottom?: number };

function Option({
  label,
  checked,
  onToggle,
  count,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  count?: number; // solo en Details
}) {
  return (
    <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="accent-red-600"
      />
      <span className="flex-1 truncate text-gray-700">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-gray-400">{count}</span>
      )}
    </label>
  );
}

export function AddToListButton({
  id,
  variant = "card",
}: {
  id: number;
  variant?: "card" | "details";
}) {
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { lists, isInList, toggleInList, createList, listNameError } =
    useLists();
  const [pos, setPos] = useState<Pos | null>(null);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const open = pos !== null;

  const details = variant === "details";
  const menuWidth = details ? 260 : 220;

  // ¿Está guardado en algún lado? Cambia el aspecto del botón
  const saved = isFavorite(id) || lists.some((l) => l.pokemon.includes(id));

  const btnClass = details
    ? `px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition cursor-pointer whitespace-nowrap ${
        saved
          ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
          : "border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500"
      }`
    : `add-btn${saved ? " is-saved" : ""}`;
  const btnLabel = details ? (saved ? "✓ Saved" : "+ Save") : saved ? "✓" : "+";

  function handleClick(e: ReactMouseEvent) {
    // En las cards, que el click no llegue al Link
    e.preventDefault();
    e.stopPropagation();
    if (open || !btnRef.current) {
      setPos(null);
      return;
    }
    // Se ubica según dónde está el botón en la pantalla
    const r = btnRef.current.getBoundingClientRect();
    const left = Math.max(
      8,
      Math.min(r.right - menuWidth, window.innerWidth - menuWidth - 8),
    );
    const fitsBelow = r.bottom + MENU_MAX_HEIGHT < window.innerHeight;
    setPos(
      fitsBelow
        ? { left, top: r.bottom + 4 }
        : { left, bottom: window.innerHeight - r.top + 4 },
    );
  }

  // Cerrar: click afuera, Escape, scroll de la página o cambio de tamaño
  useEffect(() => {
    if (!open) return;
    const close = () => setPos(null);
    const inside = (t: EventTarget | null) =>
      menuRef.current?.contains(t as Node) ||
      btnRef.current?.contains(t as Node);

    function onDown(e: MouseEvent) {
      if (!inside(e.target)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    function onScroll(e: Event) {
      // El scroll dentro del propio menú no lo cierra
      if (!menuRef.current?.contains(e.target as Node)) close();
    }

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    const err = listNameError(newName);
    if (err) {
      setCreateError(err);
      return;
    }
    // Crea la lista y mete este Pokémon de una
    const listId = createList(newName);
    if (listId) toggleInList(listId, id);
    setNewName("");
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleClick}
        title="Save to..."
        className={btnClass}
      >
        {btnLabel}
      </button>

      {pos &&
        createPortal(
          // stopPropagation: aunque se dibuja en el <body>, en React
          // el evento igual subiría hasta el Link de la card
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              width: menuWidth,
              left: pos.left,
              top: pos.top,
              bottom: pos.bottom,
            }}
            className="z-[100] bg-white border border-gray-200 rounded-xl shadow-xl p-2 text-sm"
          >
            <p className="px-2 pt-1 pb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">
              Save to
            </p>

            <div className="max-h-56 overflow-y-auto">
              <Option
                label="♥ Favorites"
                checked={isFavorite(id)}
                onToggle={() => toggleFavorite(id)}
                count={details ? favorites.length : undefined}
              />
              {lists.map((l) => (
                <Option
                  key={l.id}
                  label={l.name}
                  checked={isInList(l.id, id)}
                  onToggle={() => toggleInList(l.id, id)}
                  count={details ? l.pokemon.length : undefined}
                />
              ))}
            </div>

            <form
              onSubmit={handleCreate}
              className="flex gap-1 mt-2 pt-2 border-t border-gray-100"
            >
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New list..."
                maxLength={40}
                className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-red-400"
              />
              <button
                type="submit"
                className="px-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition cursor-pointer"
              >
                Add
              </button>
            </form>
            {createError && (
              <p className="px-1 pt-1.5 text-[11px] text-red-500">
                {createError}
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
