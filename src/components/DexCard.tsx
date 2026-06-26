import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { Pokemon } from '../types/pokemon'
import { POKEMON_DATA } from '../data/pokemon-data'
import { getRegionalDisplayName } from '../lib/regional'
import { TypeBadge } from './badges/TypeBadge'
import { FormBadge } from './badges/FormBadge'
import { FavButton } from './FavButton'

export function DexCard({ pokemon }: { pokemon: Pokemon }) {
  const types = pokemon.types.map((t) => t.type.name)
  const staticSprite = pokemon.sprites.front_default ?? ''
  const animatedSprite =
    pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default ||
    staticSprite

  const entry = POKEMON_DATA.find((e) => e.id === pokemon.id)
  const forms = entry?.forms ?? []
  const displayName = getRegionalDisplayName(pokemon.name)

  const [hover, setHover] = useState(false)

  return (
    <Link
      to={`/details/${pokemon.id}`}
      className="dex-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {forms.length > 0 && (
        <div className="form-badges">
          {forms.map((f) => <FormBadge key={f} form={f} />)}
        </div>
      )}
      <span className="dex-card-dexnum">#{pokemon.id}</span>
      <img src={hover ? animatedSprite : staticSprite} alt={pokemon.name} />
      <span className="dex-card-name">{displayName}</span>
      <hr />
      <div className="dex-card-types">
        {types.map((t) => <TypeBadge key={t} type={t} />)}
      </div>
      <FavButton id={pokemon.id} />
    </Link>
  )
}