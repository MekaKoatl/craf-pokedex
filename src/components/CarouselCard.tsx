import { Link } from 'react-router-dom'
import type { Pokemon } from '../types/pokemon'
import { getRegionalDisplayName } from '../lib/regional'
import { cdnSprite } from '../lib/sprites'

export function CarouselCard({ pokemon, isCenter }: { pokemon: Pokemon; isCenter: boolean }) {
  const staticSprite = cdnSprite(pokemon.sprites.front_default)
  const animatedSprite =
    cdnSprite(pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default) ||
    staticSprite

  return (
    <Link to={`/details/${pokemon.id}`} className={`carousel-card${isCenter ? ' center' : ''}`}>
      <img src={isCenter ? animatedSprite : staticSprite} alt={pokemon.name} />
      <span>{getRegionalDisplayName(pokemon.name)}</span>
    </Link>
  )
}