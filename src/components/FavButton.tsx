import { useFavorites } from "../hooks/useFavorites";
import heartBase from "../assets/heartbase.png";
import heartFull from "../assets/heartfull.png";

export function FavButton({ id }: { id: number }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(id);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
  }

  return (
    <button className="fav-btn" onClick={handleClick} title="Favorite">
      <img
        src={active ? heartFull : heartBase}
        alt="favorite"
        style={{ width: "1.5rem", height: "1.5rem" }}
      />
    </button>
  );
}