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

export function DexCard({
  pokemon,
  pixel = false,
}: {
  pokemon: Pokemon;
  pixel?: boolean; // true = siempre sprite pixel (las cards dentro de Details)
}) {
  const [hovered, setHovered] = useState(false);
  // Si este Pokémon no tiene Dream World, se pasa al arte oficial
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
      <span className="dex-card-dexnum">#{pokemon.id}</span>
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
          // Escritorio: pixel, y animado al pasar el mouse
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
