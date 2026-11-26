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

/** Alto aproximado del menú; si no entra debajo del botón, se abre hacia arriba. */
const MENU_MAX_HEIGHT = 320;

/** Por debajo de este ancho se usa un modal en lugar del menú flotante. */
const MOBILE_QUERY = "(max-width: 639px)";

/** Posición del menú flotante en la pantalla. */
type Pos = { left: number; top?: number; bottom?: number };

/**
 * Fila del menú (Favorites o una lista): el nombre y, a la derecha, "Add" o ✓
 * según si el Pokémon está guardado ahí. Toda la fila cambia el estado.
 */
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
  /** Versión del modal: filas de 45px. */
  big?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      aria-label={checked ? `Remove from ${label}` : `Add to ${label}`}
      className={`group w-full flex items-center rounded-lg hover:bg-gray-50 cursor-pointer text-left ${
        big ? "min-h-[45px] gap-3 px-2" : "gap-2 px-2 py-1"
      }`}
    >
      <span
        className={`flex-1 truncate text-gray-800 ${big ? "text-base" : ""}`}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-gray-400">{count}</span>
      )}
      {/* Estado: "Add" con borde si no está guardado, ✓ rojo si lo está */}
      <span
        className={`flex-none flex items-center justify-center rounded-lg border-[1.5px] font-semibold transition ${
          big ? "w-14 h-8 text-sm" : "w-11 h-6 text-[11px]"
        } ${
          checked
            ? "bg-red-600 border-red-600 text-white"
            : "bg-white border-red-200 text-red-600 group-hover:border-red-400"
        }`}
      >
        {checked ? "✓" : "Add"}
      </span>
    </button>
  );
}

/**
 * Botón "+" para guardar un Pokémon en favoritos o en listas, o crear una
 * lista nueva con él. En escritorio abre un menú flotante; en celular, un modal.
 */
export function AddToListButton({
  id,
  name,
  variant = "card",
}: {
  id: number;
  /** Nombre visible, para el título del modal. */
  name?: string;
  /** "card" para tarjetas; "details" para el encabezado de Details. */
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

  // Si está guardado en algún lado, el botón se ve marcado
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
    // En las tarjetas, evita que el clic active el Link
    e.preventDefault();
    e.stopPropagation();
    if (open || !btnRef.current) {
      close();
      return;
    }
    // Celular: modal
    if (window.matchMedia(MOBILE_QUERY).matches) {
      setModal(true);
      return;
    }
    // Escritorio: menú flotante junto al botón
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

  // El menú flotante se cierra con clic afuera, Escape, scroll o cambio de tamaño
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
      // El scroll dentro del menú no lo cierra
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

  // El modal se cierra con Escape y bloquea el scroll de la página
  useEffect(() => {
    if (!modal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModal(false);
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      // Restaura el scroll al cerrar
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
    // Crea la lista con este Pokémon
    const listId = createList(newName);
    if (listId) toggleInList(listId, id);
    setNewName("");
  }

  // Contenido compartido por el menú y el modal; `big` agranda todo para el modal
  const body = (big: boolean) => (
    <>
      <div
        className={
          big ? "max-h-[50vh] overflow-y-auto" : "max-h-56 overflow-y-auto"
        }
      >
        <Option
          label="Favorites"
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
          // 16px en el modal: con menos, iOS hace zoom al enfocar
          className={`flex-1 min-w-0 px-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 ${
            big ? "h-[45px] text-base" : "py-1 text-xs"
          }`}
        />
        <button
          type="submit"
          className={`btn-primary rounded-lg ${
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

      {/* Escritorio: menú flotante, dibujado en <body> con un portal */}
      {pos &&
        createPortal(
          // Los eventos de React suben por el árbol de componentes aunque el
          // portal esté en <body>; se detienen para no activar el Link de la tarjeta
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

      {/* Celular: modal centrado; tocar el fondo lo cierra */}
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
              // Los toques dentro de la ventana no la cierran
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
