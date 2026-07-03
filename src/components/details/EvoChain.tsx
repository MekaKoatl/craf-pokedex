import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPokemon } from '../../lib/api'
import { getRegionalDisplayName } from '../../lib/regional'
import { getEvoCondition, buildLinearPath, getChildren } from '../../lib/evolution'
import type { EvolutionChain, Pokemon } from '../../types/pokemon'

function EvoNodeCard({ p, isCurrent, cond }: { p: Pokemon; isCurrent: boolean; cond?: string }) {
  const inner = (
    <>
      <img src={p.sprites.front_default ?? ''} alt={p.name} className="evo-node-img" />
      <span className="evo-node-name">{getRegionalDisplayName(p.name)}</span>
      {cond && <span className="evo-node-cond">{cond}</span>}
    </>
  )
  return isCurrent ? (
    <div className="evo-node evo-node-current">{inner}</div>
  ) : (
    <Link to={`/details/${p.id}`} className="evo-node">{inner}</Link>
  )
}

function Arrow({ cond }: { cond?: string }) {
  return (
    <div className="evo-arrow">
      <div className="evo-arrow-tip" />
      {cond && <span className="evo-arrow-label">{cond}</span>}
    </div>
  )
}

export function EvoChain({
  chain, currentName, currentId,
}: { chain: EvolutionChain; currentName: string; currentId: number }) {
  const path = buildLinearPath(chain.chain, currentName)
  const children = getChildren(chain.chain, currentName)

  // Nombres a pedir: la ruta lineal + los hijos (para ramas)
  const names = [...path.map((s) => s.name), ...children.map((c) => c.species.name)]

  const { data: pokes } = useQuery({
    queryKey: ['evo', currentName],
    queryFn: async () => {
      const results = await Promise.all(names.map((n) => getPokemon(n)))
      const map: Record<string, Pokemon> = {}
      results.forEach((p) => { map[p.name] = p })
      return map
    },
  })

  if (path.length === 1 && children.length === 0)
    return <p className="evo-no-evo">This Pokémon does not evolve.</p>
  if (!pokes) return null

  return (
    <div className="evo-chain-wrapper">
      {path.map((step, i) => (
        <div key={step.name} className="flex items-center">
          {i > 0 && <Arrow cond={getEvoCondition(path[i - 1].nextDetail ?? undefined)} />}
          <EvoNodeCard p={pokes[step.name]} isCurrent={step.name === currentName} />
        </div>
      ))}

      {children.length === 1 && (
        <div className="flex items-center">
          <Arrow cond={getEvoCondition(children[0].evolution_details[0])} />
          <EvoNodeCard p={pokes[children[0].species.name]} isCurrent={false} />
        </div>
      )}

      {children.length > 1 && (
        <>
          <Arrow />
          <div className="evo-branch-grid">
            {children.map((c) => (
              <EvoNodeCard
                key={c.species.name}
                p={pokes[c.species.name]}
                isCurrent={false}
                cond={getEvoCondition(c.evolution_details[0])}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}