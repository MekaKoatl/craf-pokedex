import { useParams } from 'react-router-dom'
import { usePokemonDetails } from '../hooks/usePokemonDetails'
import { useFavorites } from '../hooks/useFavorites'
import { getRegionalDisplayName } from '../lib/regional'
import { LoadingSpinner } from '../components/LoadingSpinner'

export function Details() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = usePokemonDetails(id!)
  const { isFavorite, toggleFavorite } = useFavorites()

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-8"><LoadingSpinner text="Loading..." /></div>
  if (isError || !data) return <p className="p-8 text-gray-600">Pokémon not found.</p>

  const { pokemon, species } = data
  const displayName = getRegionalDisplayName(pokemon.name)
  const genus = species.genera.find((g) => g.language.name === 'en')?.genus ?? ''
  const mainSprite =
    pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || ''
  const active = isFavorite(pokemon.id)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-start gap-6 mb-6">
        <button onClick={() => history.back()} className="mt-2 text-gray-500 hover:text-red-600 transition font-semibold text-sm">← Return</button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">#{String(pokemon.id).padStart(3, '0')} {displayName}</h1>
          <p className="text-lg text-gray-500 mt-1">{genus}</p>
        </div>
        <button
          onClick={() => toggleFavorite(pokemon.id)}
          className={`mt-2 fav-btn${active ? ' fav-active' : ''}`}
          style={{ position: 'static', fontSize: '1.5rem' }}
          title="Favorite"
        >♥</button>
      </div>

      <div className="flex-1 bg-gray-100 rounded-xl flex items-center justify-center min-h-[300px] mb-8">
        <img src={mainSprite} alt={pokemon.name} className="w-64 h-64 object-contain" />
      </div>

      {/* Aquí irán: galería sprites, tipos/gen/habitat, evo chain, stats, more info, formas */}
    </main>
  )
}