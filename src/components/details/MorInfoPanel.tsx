import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { PokemonFull, Species } from '../../types/pokemon'

const COLOR_MAP: Record<string, string> = {
  black: '#1f2937', blue: '#3b82f6', brown: '#92400e', gray: '#9ca3af',
  green: '#22c55e', pink: '#ec4899', purple: '#a855f7', red: '#ef4444',
  white: '#e5e7eb', yellow: '#eab308',
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">{label}</h3>
      <div className="text-gray-700 text-sm">{children}</div>
    </div>
  )
}

export function MoreInfoPanel({ pokemon, species }: { pokemon: PokemonFull; species: Species }) {
  const [open, setOpen] = useState(false)

  const { data: locations } = useQuery({
    queryKey: ['locations', pokemon.id],
    queryFn: async () => {
      const res = await fetch(pokemon.location_area_encounters)
      const data = await res.json()
      return [...new Set(data.map((l: { location_area: { name: string } }) => l.location_area.name.replace(/-/g, ' ')))] as string[]
    },
    enabled: open,
  })

  const eggGroups = species.egg_groups?.map((g) => g.name.replace(/-/g, ' ')).join(', ') || 'Unknown'
  const gender = species.gender_rate === -1
    ? 'Genderless'
    : `♂ ${(100 - (species.gender_rate / 8) * 100).toFixed(1)}% · ♀ ${((species.gender_rate / 8) * 100).toFixed(1)}%`
  const catchPct = ((species.capture_rate / 255) * 100).toFixed(1)
  const colorName = species.color?.name ?? 'unknown'

  return (
    <div className="mb-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-400 border border-gray-200 rounded-xl hover:border-gray-300 hover:text-gray-600 transition bg-gray-50"
      >
        {open ? 'Less Info −' : 'More Info +'}
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card label="Egg Groups"><span className="capitalize">{eggGroups}</span></Card>
          <Card label="Gender Ratio">{gender}</Card>
          <Card label="Base Experience">{pokemon.base_experience ? `${pokemon.base_experience} XP` : 'Unknown'}</Card>
          <Card label="Capture Rate">{species.capture_rate} ({catchPct}%)</Card>
          <Card label="Shape"><span className="capitalize">{species.shape?.name?.replace(/-/g, ' ') ?? 'Unknown'}</span></Card>
          <Card label="Pokédex Color">
            <span className="inline-block w-3.5 h-3.5 rounded-sm mr-1.5 align-middle border border-gray-200" style={{ background: COLOR_MAP[colorName] ?? '#ccc' }} />
            <span className="capitalize">{colorName}</span>
          </Card>
          <Card label="Base Friendship">{species.base_happiness ?? 'Unknown'}</Card>
          <Card label="Leveling Rate"><span className="capitalize">{species.growth_rate?.name?.replace(/-/g, ' ') ?? 'Unknown'}</span></Card>
          <Card label="Locations">
            {!locations ? 'Loading...' : locations.length === 0 ? 'Not found in the wild' : (
              <div className="flex flex-wrap gap-1">
                {locations.map((n) => (
                  <span key={n} className="inline-block bg-gray-100 border border-gray-200 rounded px-2 py-0.5 text-xs capitalize">{n}</span>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}