import type { PokemonFull } from '../../types/pokemon'

const COLORS: Record<string, string> = {
  hp: '#ef4444', attack: '#f97316', defense: '#eab308',
  'special-attack': '#3b82f6', 'special-defense': '#22c55e', speed: '#a855f7',
}
const LABELS: Record<string, string> = {
  hp: 'HP', attack: 'ATK', defense: 'DEF',
  'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', speed: 'SPD',
}

export function StatBars({ stats }: { stats: PokemonFull['stats'] }) {
  return (
    <div className="flex flex-col gap-3">
      {stats.map((s) => {
        const pct = Math.min((s.base_stat / 255) * 100, 100)
        return (
          <div key={s.stat.name} className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 w-16 flex-shrink-0">{LABELS[s.stat.name] ?? s.stat.name}</span>
            <span className="text-xs font-semibold text-gray-700 w-8 flex-shrink-0 text-right">{s.base_stat}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: COLORS[s.stat.name] ?? '#9ca3af' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}