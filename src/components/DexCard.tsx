import { Link } from "react-router-dom";
import type { Pokemon } from "../types/pokemon";
import { POKEMON_DATA } from "../data/pokemon-data";
import { getRegionalDisplayName } from "../lib/regional";
import { TypeBadge } from "./badges/TypeBadge";
import { FormBadge } from "./badges/FormBadge";
import { FavButton } from "./FavButton";

export function DexCard({ pokemon }: { pokemon: Pokemon }) {
  const types = pokemon.types.map((t) => t.type.name);
  const staticSprite = pokemon.sprites.front_default ?? "";
  const animatedSprite =
    pokemon.sprites.versions?.["generation-v"]?.["black-white"]?.animated
      ?.front_default || staticSprite;

  const entry = POKEMON_DATA.find((e) => e.id === pokemon.id);
  const baseForms = entry?.forms ?? [];
  const forms =
    entry?.isRegional && !baseForms.includes("R")
      ? [...baseForms, "R" as const]
      : baseForms;
  const displayName = getRegionalDisplayName(pokemon.name);

  return (
    <Link to={`/details/${pokemon.id}`} className="dex-card">
      {forms.length > 0 && (
        <div className="form-badges">
          {forms.map((f) => (
            <FormBadge key={f} form={f} />
          ))}
        </div>
      )}
      <span className="dex-card-dexnum">#{pokemon.id}</span>
      <div className="dex-card-sprite">
        <img className="sprite-static" src={staticSprite} alt={pokemon.name} />
        <img
          className="sprite-animated"
          src={animatedSprite}
          alt=""
          aria-hidden="true"
        />
      </div>
      <span className="dex-card-name">{displayName}</span>
      <hr />
      <div className="dex-card-types">
        {types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
      <FavButton id={pokemon.id} />
    </Link>
  );
}
