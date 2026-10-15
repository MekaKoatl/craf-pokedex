import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTickerPokemon } from "../hooks/useTickerPokemon";
import { getRegionalDisplayName } from "../lib/regional";
import { cdnSprite, boxIconUrl } from "../lib/sprites";
import { TypeBadge } from "./badges/TypeBadge";
import type { Pokemon } from "../types/pokemon";

// Sprite más grande para la tarjeta: animado si existe
function bigSpriteOf(p: Pokemon): string {
  return (
    cdnSprite(
      p.sprites.versions?.["generation-v"]?.["black-white"]?.animated
        ?.front_default,
    ) || cdnSprite(p.sprites.front_default)
  );
}

// Respaldo por si el sprite de la tarjeta no carga
function handleImgError(e: React.SyntheticEvent<HTMLImageElement>, p: Pokemon) {
  const img = e.currentTarget;
  const fallback = cdnSprite(p.sprites.front_default);
  if (fallback && img.src !== fallback) {
    img.src = fallback;
  } else {
    img.style.display = "none";
  }
}

export function SpriteTicker() {
  const { data: pool, isLoading } = useTickerPokemon();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<{ p: Pokemon; x: number } | null>(null);

  // Mientras se arma el lote, una fila de bloques latiendo
  if (isLoading) {
    return (
      <section className="ticker-section">
        <div className="ticker-mask">
          <div className="ticker-skeleton-row">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="ticker-skeleton"
                style={{ animationDelay: `${i * 0.06}s` }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

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
          <img
            src={bigSpriteOf(active.p)}
            alt=""
            onError={(e) => handleImgError(e, active.p)}
          />
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
              aria-label={p.name}
              onMouseEnter={(e) => handleEnter(p, e)}
            >
              <img src={boxIconUrl(p.id)} alt="" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
