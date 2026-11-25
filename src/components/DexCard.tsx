import { useState } from "react";
import { Link } from "react-router-dom";
import type { Pokemon } from "../types/pokemon";
import { POKEMON_DATA } from "../data/pokemon-data";
import { getRegionalDisplayName } from "../lib/regional";
import { artworkUrl, cdnSprite, dreamWorldUrl } from "../lib/sprites";
import { useIsMobile } from "../hooks/useIsMobile";
import { TypeBadge } from "./badges/TypeBadge";
import { FormBadge } from "./badges/FormBadge";
import { AddToListButton } from "./AddToListButton";
import { SpriteImg } from "./SpriteImg";

/**
 * Tarjeta de un Pokémon con imagen, número, nombre y tipos, que lleva a su página.
 * En celular muestra el arte de Dream World (o el oficial si no existe);
 * en escritorio, el sprite pixelado, animado al pasar el mouse.
 */
export function DexCard({
  pokemon,
  pixel = false,
}: {
  pokemon: Pokemon;
  /** Usa siempre el sprite pixelado, también en celular (tarjetas dentro de Details). */
  pixel?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  // true si el arte de Dream World falló y se usa el oficial
  const [noDreamWorld, setNoDreamWorld] = useState(false);
  const isMobile = useIsMobile();
  const showArt = isMobile && !pixel;

  const types = pokemon.types.map((t) => t.type.name);
  const staticSprite = cdnSprite(pokemon.sprites.front_default);
  const animatedSprite =
    cdnSprite(
      pokemon.sprites.versions?.["generation-v"]?.["black-white"]?.animated
        ?.front_default,
    ) || staticSprite;
  const artSprite = noDreamWorld
    ? artworkUrl(pokemon.id)
    : dreamWorldUrl(pokemon.id);

  const entry = POKEMON_DATA.find((e) => e.id === pokemon.id);
  const baseForms = entry?.forms ?? [];
  const forms =
    entry?.isRegional && !baseForms.includes("R")
      ? [...baseForms, "R" as const]
      : baseForms;
  const displayName = getRegionalDisplayName(pokemon.name);

  return (
    <Link
      to={`/details/${pokemon.id}`}
      className="dex-card"
      onMouseEnter={() => setHovered(true)}
    >
      {forms.length > 0 && (
        <div className="form-badges">
          {forms.map((f) => (
            <FormBadge key={f} form={f} />
          ))}
        </div>
      )}
      <div className="dex-card-sprite">
        {showArt ? (
          // Celular: Dream World, o arte oficial si no existe
          <SpriteImg
            className="dex-card-art"
            src={artSprite}
            alt={pokemon.name}
            onError={() => setNoDreamWorld(true)}
          />
        ) : (
          // Escritorio: sprite pixelado, animado al pasar el mouse
          <>
            <SpriteImg
              className="sprite-static"
              src={staticSprite}
              alt={pokemon.name}
            />
            {hovered && (
              <SpriteImg
                className="sprite-animated"
                src={animatedSprite}
                alt=""
                aria-hidden="true"
              />
            )}
          </>
        )}
      </div>
      <span className="dex-card-dexnum">#{pokemon.id}</span>
      <span className="dex-card-name">{displayName}</span>
      <hr />
      <div className="dex-card-types">
        {types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
      <AddToListButton id={pokemon.id} name={displayName} />
    </Link>
  );
}
