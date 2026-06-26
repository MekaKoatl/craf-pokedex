import { useFavorites } from '../hooks/useFavorites'

export function FavButton({ id }: { id: number }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const active = isFavorite(id)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()   // no navegar (la carta es un link)
    e.stopPropagation()  // no propagar el clic a la carta
    toggleFavorite(id)
  }

  return (
    <button
      className={`fav-btn${active ? ' fav-active' : ''}`}
      onClick={handleClick}
      title="Favorite"
    >
      ♥
    </button>
  )
}