import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPokemonById } from "../../lib/api";
import { getRegionalDisplayName } from "../../lib/regional";
import { cdnSprite } from "../../lib/sprites";
import {
  getEvoCondition,
  buildLinearPath,
  getChildren,
} from "../../lib/evolution";
import type { EvolutionChain, Pokemon } from "../../types/pokemon";

function EvoNodeCard({
  p,
  isCurrent,
  cond,
}: {
  p: Pokemon;
  isCurrent: boolean;
  cond?: string;
}) {
  const inner = (
    <>
      <img
        src={cdnSprite(p.sprites.front_default)}
        alt={p.name}
        className="evo-node-img"
      />
      <span className="evo-node-name">{getRegionalDisplayName(p.name)}</span>
      {cond && <span className="evo-node-cond">{cond}</span>}
    </>
  );
  return isCurrent ? (
    <div className="evo-node evo-node-current">{inner}</div>
  ) : (
    <Link to={`/details/${p.id}`} className="evo-node">
      {inner}
    </Link>
  );
}

function Arrow({ cond }: { cond?: string }) {
  return (
    <div className="evo-arrow">
      <div className="evo-arrow-tip" />
      {cond && <span className="evo-arrow-label">{cond}</span>}
    </div>
  );
}

export function EvoChain({
  chain,
  currentName,
  suffix,
}: {
  chain: EvolutionChain;
  currentName: string;
  currentId: number;
  suffix?: string;
}) {
  const path = buildLinearPath(chain.chain, currentName);
  const children = getChildren(chain.chain, currentName);

  const names = [
    ...path.map((s) => s.name),
    ...children.map((c) => c.species.name),
    ...children.flatMap((c) =>
      getChildren(chain.chain, c.species.name).map((g) => g.species.name),
    ),
  ];

  const { data: pokes } = useQuery({
    queryKey: ["evo", currentName, suffix ?? ""],
    queryFn: async () => {
      const map: Record<string, Pokemon> = {};
      await Promise.all(
        names.map(async (n) => {
          if (suffix) {
            const regional = await fetchPokemonById(`${n}${suffix}`);
            if (regional) {
              map[n] = regional;
              return;
            }
          }
          const normal = await fetchPokemonById(n);
          if (normal) map[n] = normal;
        }),
      );
      return map;
    },
  });

  if (path.length === 1 && children.length === 0)
    return <p className="evo-no-evo">This Pokémon does not evolve.</p>;
  if (!pokes) return null;

  return (
    <div className="evo-chain-wrapper">
      {path.map((step, i) =>
        pokes[step.name] ? (
          <div key={step.name} className="flex items-center">
            {i > 0 && (
              <Arrow
                cond={getEvoCondition(path[i - 1].nextDetail ?? undefined)}
              />
            )}
            <EvoNodeCard
              p={pokes[step.name]}
              isCurrent={step.name === currentName}
            />
          </div>
        ) : null,
      )}

      {children.length === 1 &&
        (() => {
          const child = children[0];
          const grandchildren = getChildren(chain.chain, child.species.name);
          return (
            <>
              {pokes[child.species.name] && (
                <div className="flex items-center">
                  <Arrow cond={getEvoCondition(child.evolution_details[0])} />
                  <EvoNodeCard
                    p={pokes[child.species.name]}
                    isCurrent={false}
                  />
                </div>
              )}
              {grandchildren.length === 1 &&
                pokes[grandchildren[0].species.name] && (
                  <div className="flex items-center">
                    <Arrow
                      cond={getEvoCondition(
                        grandchildren[0].evolution_details[0],
                      )}
                    />
                    <EvoNodeCard
                      p={pokes[grandchildren[0].species.name]}
                      isCurrent={false}
                    />
                  </div>
                )}
            </>
          );
        })()}

      {children.length > 1 && (
        <>
          <Arrow />
          <div className="evo-branch-grid">
            {children.map((c) =>
              pokes[c.species.name] ? (
                <EvoNodeCard
                  key={c.species.name}
                  p={pokes[c.species.name]}
                  isCurrent={false}
                  cond={getEvoCondition(c.evolution_details[0])}
                />
              ) : null,
            )}
          </div>
        </>
      )}
    </div>
  );
}
