import { Link } from 'react-router-dom'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <p className="text-5xl">♡</p>
      <p className="text-gray-400 font-semibold text-lg">No favorites yet</p>
      <p className="text-gray-300 text-sm">Add some Pokémon from the various dex galleries</p>
      <Link
        to="/dxg"
        className="mt-2 px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition text-sm"
      >
        Pokemon Dex
      </Link>
    </div>
  )
}