import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRegionalDisplayName } from "../../lib/regional";
import { cdnSprite } from "../../lib/sprites";
import {
  getEvoCondition,
  buildLinearPath,
  getDescendantLevels,
  listTransitions,
} from "../../lib/evolution";
import type { EvolutionChain, Pokemon } from "../../types/pokemon";
import { SpriteImg } from "../SpriteImg";
import { fetchPokemonById, fetchPokemonBySpecies } from "../../lib/api";

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
      <SpriteImg
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
  const [showReqs, setShowReqs] = useState(false);

  // Lo que viene antes del actual (y el actual)
  const path = buildLinearPath(chain.chain, currentName);
  // Lo que viene después, agrupado por nivel
  const levels = getDescendantLevels(chain.chain, currentName);
  // Todos los pasos de la cadena, para el panel de requisitos
  const transitions = listTransitions(chain.chain);

  const names = [
    ...path.map((s) => s.name),
    ...levels.flat().map((n) => n.species.name),
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
          const normal = await fetchPokemonBySpecies(n);
          if (normal) map[n] = normal;
        }),
      );
      return map;
    },
  });

  if (path.length === 1 && levels.length === 0)
    return <p className="evo-no-evo">This Pokémon does not evolve.</p>;
  if (!pokes) return null;

  return (
    <>
      <div className="evo-chain-wrapper">
        {/* Ancestros + actual */}
        {path.map((step, i) =>
          pokes[step.name] ? (
            <div key={step.name} className="flex items-center evo-step">
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

        {/* Descendientes, nivel por nivel */}
        {levels.map((level, li) => {
          // Un solo descendiente: va en línea, con la condición en la flecha
          if (level.length === 1) {
            const node = level[0];
            if (!pokes[node.species.name]) return null;
            return (
              <div key={`evo-lvl-${li}`} className="flex items-center evo-step">
                <Arrow cond={getEvoCondition(node.evolution_details[0])} />
                <EvoNodeCard p={pokes[node.species.name]} isCurrent={false} />
              </div>
            );
          }
          // Varios: flecha suelta y grid, con la condición en cada tarjeta
          return (
            <Fragment key={`evo-lvl-${li}`}>
              <Arrow />
              <div className="evo-branch-grid">
                {level.map((c) =>
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
            </Fragment>
          );
        })}
      </div>

      {/* Requisitos completos, colapsado por defecto */}
      {transitions.length > 0 && (
        <div className="evo-req">
          <button
            className="evo-req-toggle"
            onClick={() => setShowReqs((v) => !v)}
          >
            <span>Evolution requirements</span>
            <span>{showReqs ? "−" : "+"}</span>
          </button>

          {showReqs && (
            <div className="evo-req-body">
              {transitions.map((t) => (
                <div key={`${t.from}-${t.to}`} className="evo-req-row">
                  <div className="evo-req-names">
                    {getRegionalDisplayName(t.from)} →{" "}
                    {getRegionalDisplayName(t.to)}
                  </div>
                  {t.ways.map((way, i) => (
                    <Fragment key={i}>
                      {i > 0 && <div className="evo-req-or">or</div>}
                      <ul className="evo-req-list">
                        {way.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </Fragment>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}