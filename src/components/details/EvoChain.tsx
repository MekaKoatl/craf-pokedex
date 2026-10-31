import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRegionalDisplayName } from "../../lib/regional";
import { cdnSprite } from "../../lib/sprites";
import {
  getEvoCondition,
  describeEvolution,
  buildFormPath,
  getFormLevels,
  type FormStep,
} from "../../lib/evolution";
import type { EvolutionChain, Pokemon } from "../../types/pokemon";
import { SpriteImg } from "../SpriteImg";
import { fetchPokemonById, fetchPokemonBySpecies } from "../../lib/api";

// Identificador de un paso: especie + forma
const keyOf = (s: FormStep) => `${s.species}|${s.form ?? ""}`;
const labelOf = (s: FormStep) => getRegionalDisplayName(s.form ?? s.species);

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
  currentForm,
}: {
  chain: EvolutionChain;
  currentName: string; // especie
  currentForm: string | null; // forma regional, o null si es la normal
}) {
  const [showReqs, setShowReqs] = useState(false);

  // Ancestros + actual, siguiendo solo la forma que estás viendo
  const path = buildFormPath(chain.chain, currentName, currentForm);
  const current = path[path.length - 1];
  // Lo que viene después, nivel por nivel
  const levels = getFormLevels(chain.chain, current);

  const steps = [...path, ...levels.flat()];
  // Cada paso con un "from" es una transición para el panel de requisitos
  const transitions = steps.filter((s) => s.from);

  const { data: pokes } = useQuery({
    queryKey: ["evo", currentName, currentForm ?? ""],
    queryFn: async () => {
      const map: Record<string, Pokemon> = {};
      await Promise.all(
        steps.map(async (s) => {
          // Forma regional: por nombre exacto. Normal: por especie
          const p = s.form
            ? await fetchPokemonById(s.form)
            : await fetchPokemonBySpecies(s.species);
          if (p) map[keyOf(s)] = p;
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
          pokes[keyOf(step)] ? (
            <div key={keyOf(step)} className="flex items-center evo-step">
              {i > 0 && <Arrow cond={getEvoCondition(step.details[0])} />}
              <EvoNodeCard
                p={pokes[keyOf(step)]}
                isCurrent={step === current}
              />
            </div>
          ) : null,
        )}

        {/* Descendientes, nivel por nivel */}
        {levels.map((level, li) => {
          // Un solo descendiente: va en línea, con la condición en la flecha
          if (level.length === 1) {
            const s = level[0];
            if (!pokes[keyOf(s)]) return null;
            return (
              <div key={`evo-lvl-${li}`} className="flex items-center evo-step">
                <Arrow cond={getEvoCondition(s.details[0])} />
                <EvoNodeCard p={pokes[keyOf(s)]} isCurrent={false} />
              </div>
            );
          }
          // Varios: flecha suelta y grid, con la condición en cada tarjeta
          return (
            <Fragment key={`evo-lvl-${li}`}>
              <Arrow />
              <div className="evo-branch-grid">
                {level.map((s) =>
                  pokes[keyOf(s)] ? (
                    <EvoNodeCard
                      key={keyOf(s)}
                      p={pokes[keyOf(s)]}
                      isCurrent={false}
                      cond={getEvoCondition(s.details[0])}
                    />
                  ) : null,
                )}
              </div>
            </Fragment>
          );
        })}
      </div>

      {/* Requisitos de esta línea, colapsado por defecto */}
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
                <div
                  key={`${keyOf(t.from!)}-${keyOf(t)}`}
                  className="evo-req-row"
                >
                  <div className="evo-req-names">
                    {labelOf(t.from!)} → {labelOf(t)}
                  </div>
                  {t.details.map(describeEvolution).map((way, i) => (
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