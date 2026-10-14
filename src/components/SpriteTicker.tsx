import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTickerPokemon } from "../hooks/useTickerPokemon";
import { getRegionalDisplayName } from "../lib/regional";
import { cdnSprite } from "../lib/sprites";
import { TypeBadge } from "./badges/TypeBadge";
import type { Pokemon } from "../types/pokemon";

// Icono de PC, con el sprite normal como respaldo (gen 9 no tiene icono)
function iconOf(p: Pokemon): string {
  return (
    cdnSprite(p.sprites.versions?.["generation-viii"]?.icons?.front_default) ||
    cdnSprite(p.sprites.versions?.["generation-vii"]?.icons?.front_default) ||
    cdnSprite(p.sprites.front_default)
  );
}

// Sprite más grande para la tarjeta: animado si existe
function bigSpriteOf(p: Pokemon): string {
  return (
    cdnSprite(
      p.sprites.versions?.["generation-v"]?.["black-white"]?.animated
        ?.front_default,
    ) || cdnSprite(p.sprites.front_default)
  );
}

export function SpriteTicker() {
  const { data: pool } = useTickerPokemon();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<{ p: Pokemon; x: number } | null>(null);

  if (!pool || pool.length === 0) return null;

  function handleEnter(p: Pokemon, e: React.MouseEvent<HTMLAnchorElement>) {
    const section = sectionRef.current;
    if (!section) return;

    const icon = e.currentTarget.getBoundingClientRect();
    const box = section.getBoundingClientRect();

    // Centro del icono, relativo a la sección
    let x = icon.left - box.left + icon.width / 2;
    // No dejar que la tarjeta se salga por los bordes
    x = Math.max(100, Math.min(x, box.width - 100));

    setActive({ p, x });
  }

  // La lista va duplicada para que el loop sea continuo
  const doubled = [...pool, ...pool];

  return (
    <section
      ref={sectionRef}
      className="ticker-section"
      onMouseLeave={() => setActive(null)}
    >
      {active && (
        <Link
          to={`/details/${active.p.id}`}
          className="ticker-card"
          style={{ left: `${active.x}px` }}
        >
          <span className="ticker-card-num">#{active.p.id}</span>
          <img src={bigSpriteOf(active.p)} alt={active.p.name} />
          <span className="ticker-card-name">
            {getRegionalDisplayName(active.p.name)}
          </span>
          <div className="ticker-card-types">
            {active.p.types.map((t) => (
              <TypeBadge key={t.type.name} type={t.type.name} />
            ))}
          </div>
        </Link>
      )}

      <div className="ticker-mask">
        <div className={`ticker-track${active ? " paused" : ""}`}>
          {doubled.map((p, i) => (
            <Link
              key={`${p.id}-${i}`}
              to={`/details/${p.id}`}
              className="ticker-item"
              onMouseEnter={(e) => handleEnter(p, e)}
            >
              <img src={iconOf(p)} alt={p.name} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}