import { Link } from "react-router-dom";
import { useFavorites } from "../../hooks/useFavorites";
import { useLists } from "../../hooks/useLists";

/** Listas que se muestran como chip; el resto se resume en "N+". */
const MAX_CHIPS = 6;

const chip =
  "relative inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition after:absolute after:inset-x-0 after:-inset-y-3";
const listChip = `${chip} bg-red-50 text-red-600 border-red-200 hover:bg-red-100`;
const moreChip = `${chip} bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100`;

/** Chips con los lugares donde está guardado un Pokémon (favoritos y listas), con link a cada uno. No se muestra si no está guardado. */
export function SavedIn({ id }: { id: number }) {
  const { isFavorite } = useFavorites();
  const { lists } = useLists();
  const inLists = lists.filter((l) => l.pokemon.includes(id));

  if (!isFavorite(id) && inLists.length === 0) return null;

  const visible = inLists.slice(0, MAX_CHIPS);
  const extra = inLists.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-3 sm:gap-1.5 mt-2">
      {" "}
      <span className="text-xs text-gray-400">Saved in:</span>
      {isFavorite(id) && (
        <Link to="/favorites" className={listChip}>
          ♥ Favorites
        </Link>
      )}
      {visible.map((l) => (
        <Link key={l.id} to={`/lists/${l.id}`} className={listChip}>
          {l.name}
        </Link>
      ))}
      {extra > 0 && (
        <Link
          to="/lists"
          className={moreChip}
          title={`In ${extra} more ${extra === 1 ? "list" : "lists"}`}
        >
          {extra}+
        </Link>
      )}
    </div>
  );
}
