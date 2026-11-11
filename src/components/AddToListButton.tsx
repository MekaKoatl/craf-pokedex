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

// En pantallas así de chicas se abre un modal en vez del menú flotante
const MOBILE_QUERY = "(max-width: 639px)";

// Dónde se dibuja el menú flotante. null = cerrado
type Pos = { left: number; top?: number; bottom?: number };

function Option({
  label,
  checked,
  onToggle,
  count,
  big = false,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  count?: number;
  big?: boolean; // en el modal: filas de 45px, fáciles de tocar
}) {
  return (
    <label
      className={`flex items-center rounded-lg hover:bg-gray-50 cursor-pointer ${
        big ? "min-h-[45px] gap-3 px-2" : "gap-2 px-2 py-1.5"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className={`accent-red-600 ${big ? "w-5 h-5" : ""}`}
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
  name,
  variant = "card",
}: {
  id: number;
  name?: string; // para el título del modal
  variant?: "card" | "details";
}) {
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { lists, isInList, toggleInList, createList, listNameError } =
    useLists();
  const [pos, setPos] = useState<Pos | null>(null);
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const popoverOpen = pos !== null;
  const open = popoverOpen || modal;

  const details = variant === "details";
  const menuWidth = details ? 260 : 220;

  // ¿Está guardado en algún lado? Cambia el aspecto del botón
  const saved = isFavorite(id) || lists.some((l) => l.pokemon.includes(id));

  const btnClass = details
    ? `min-h-[45px] sm:min-h-0 px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition cursor-pointer whitespace-nowrap ${
        saved
          ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
          : "border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500"
      }`
    : `add-btn${saved ? " is-saved" : ""}`;
  const btnLabel = details ? (saved ? "✓ Saved" : "+ Save") : saved ? "✓" : "+";

  const close = () => {
    setPos(null);
    setModal(false);
  };

  function handleClick(e: ReactMouseEvent) {
    // En las cards, que el click no llegue al Link
    e.preventDefault();
    e.stopPropagation();
    if (open || !btnRef.current) {
      close();
      return;
    }
    // Celular: modal centrado
    if (window.matchMedia(MOBILE_QUERY).matches) {
      setModal(true);
      return;
    }
    // Escritorio: menú flotante al lado del botón
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

  // Menú flotante: se cierra con click afuera, Escape, scroll o cambio de tamaño
  useEffect(() => {
    if (!popoverOpen) return;
    const closeMenu = () => setPos(null);
    const inside = (t: EventTarget | null) =>
      menuRef.current?.contains(t as Node) ||
      btnRef.current?.contains(t as Node);

    function onDown(e: MouseEvent) {
      if (!inside(e.target)) closeMenu();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    function onScroll(e: Event) {
      // El scroll dentro del propio menú no lo cierra
      if (!menuRef.current?.contains(e.target as Node)) closeMenu();
    }

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", closeMenu);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [popoverOpen]);

  // Modal: Escape lo cierra, y la página de atrás queda quieta
  useEffect(() => {
    if (!modal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModal(false);
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      // Al cerrar, todo vuelve como estaba
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [modal]);

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

  // El contenido es el mismo en el menú y en el modal.
  // Es una función común que devuelve JSX, así no se escribe dos veces.
  // big = versión del modal (todo más grande para el dedo)
  const body = (big: boolean) => (
    <>
      <div
        className={
          big ? "max-h-[50vh] overflow-y-auto" : "max-h-56 overflow-y-auto"
        }
      >
        <Option
          label="♥ Favorites"
          checked={isFavorite(id)}
          onToggle={() => toggleFavorite(id)}
          count={details || big ? favorites.length : undefined}
          big={big}
        />
        {lists.map((l) => (
          <Option
            key={l.id}
            label={l.name}
            checked={isInList(l.id, id)}
            onToggle={() => toggleInList(l.id, id)}
            count={details || big ? l.pokemon.length : undefined}
            big={big}
          />
        ))}
      </div>

      <form
        onSubmit={handleCreate}
        className="flex gap-1.5 mt-2 pt-2 border-t border-gray-100"
      >
        <input
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
            setCreateError(null);
          }}
          placeholder="New list..."
          maxLength={40}
          // 16px en el modal: con menos, el iPhone hace zoom al tocar
          className={`flex-1 min-w-0 px-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 ${
            big ? "h-[45px] text-base" : "py-1 text-xs"
          }`}
        />
        <button
          type="submit"
          className={`rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition cursor-pointer ${
            big ? "min-w-[64px] px-3 text-sm" : "px-2 text-xs"
          }`}
        >
          Add
        </button>
      </form>
      {createError && (
        <p className="px-1 pt-1.5 text-[11px] text-red-500">{createError}</p>
      )}
    </>
  );

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleClick}
        title="Save to..."
        aria-label={saved ? "Saved. Edit lists" : "Save to a list"}
        className={btnClass}
      >
        {btnLabel}
      </button>

      {/* Escritorio: menú flotante */}
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
            {body(false)}
          </div>,
          document.body,
        )}

      {/* Celular: modal centrado. Tocar el fondo oscuro lo cierra */}
      {modal &&
        createPortal(
          <div
            onClick={(e) => {
              e.stopPropagation();
              setModal(false);
            }}
            className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
          >
            <div
              role="dialog"
              aria-modal="true"
              // Tocar adentro de la ventana no la cierra
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-4"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {name ? `Save ${name} to` : "Save to"}
                </p>
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  aria-label="Close"
                  className="w-[45px] h-[45px] -mr-2 flex-none flex items-center justify-center rounded-full text-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              {body(true)}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
