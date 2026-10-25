import type { PokemonFull } from '../../types/pokemon'

const COLORS: Record<string, string> = {
  hp: '#ef4444', attack: '#f97316', defense: '#eab308',
  'special-attack': '#3b82f6', 'special-defense': '#22c55e', speed: '#a855f7',
}
const LABELS: Record<string, string> = {
  hp: 'HP', attack: 'ATK', defense: 'DEF',
  'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', speed: 'SPD',
}

// base es opcional: si viene, se muestra la diferencia contra esos stats
export function StatBars({
  stats,
  base,
}: {
  stats: PokemonFull['stats']
  base?: PokemonFull['stats']
}) {
  return (
    <div className="flex flex-col gap-3">
      {stats.map((s) => {
        const pct = Math.min((s.base_stat / 255) * 100, 100)
        const ref = base?.find((b) => b.stat.name === s.stat.name)?.base_stat
        const diff = ref !== undefined ? s.base_stat - ref : 0
        return (
          <div key={s.stat.name} className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 w-16 flex-shrink-0">{LABELS[s.stat.name] ?? s.stat.name}</span>
            <span className="text-xs font-semibold text-gray-700 w-8 flex-shrink-0 text-right">{s.base_stat}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: COLORS[s.stat.name] ?? '#9ca3af' }} />
            </div>
            {base && (
              <span className={`text-xs font-semibold w-8 flex-shrink-0 text-right ${diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {diff > 0 ? `+${diff}` : diff < 0 ? diff : ''}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}