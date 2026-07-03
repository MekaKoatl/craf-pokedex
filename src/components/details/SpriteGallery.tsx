import { useState } from "react";
import type { PokemonFull } from "../../types/pokemon";
import { ImageModal } from "./ImageModal";

export function SpriteGallery({ pokemon }: { pokemon: PokemonFull }) {
  const sprites = [
    {
      src: pokemon.sprites.other?.["official-artwork"]?.front_default,
      label: "Artwork",
    },
    { src: pokemon.sprites.other?.["home"]?.front_default, label: "Home" },
    { src: pokemon.sprites.front_default, label: "Front" },
    { src: pokemon.sprites.back_default, label: "Back" },
    {
      src: pokemon.sprites.versions?.["generation-v"]?.["black-white"]?.animated
        ?.front_default,
      label: "Front Animated",
    },
    {
      src: pokemon.sprites.versions?.["generation-v"]?.["black-white"]?.animated
        ?.back_default,
      label: "Back Animated",
    },
    {
      src: pokemon.sprites.other?.["official-artwork"]?.front_shiny,
      label: "Artwork Shiny",
    },
    { src: pokemon.sprites.other?.["home"]?.front_shiny, label: "Home Shiny" },
    { src: pokemon.sprites.front_shiny, label: "Shiny" },
    { src: pokemon.sprites.back_shiny, label: "Back Shiny" },
  ].filter((s): s is { src: string; label: string } => Boolean(s.src));

  const uniqueSprites = sprites.filter(
    (s, i, arr) => arr.findIndex((x) => x.src === s.src) === i,
  );

  const artwork =
    pokemon.sprites.other?.["official-artwork"]?.front_default ||
    pokemon.sprites.front_default ||
    "";
  const [main, setMain] = useState(artwork);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="flex-1 bg-gray-100 rounded-xl flex items-center justify-center min-h-[300px] relative">
        <img
          src={main}
          alt={pokemon.name}
          className="w-64 h-64 object-contain"
        />
        <ImageModal src={main} alt={pokemon.name} />
      </div>
      <div className="grid grid-cols-3 gap-2 content-start sm:w-72 flex-shrink-0">
        {uniqueSprites.map((s) => (
          <img
            key={s.label}
            src={s.src}
            alt={s.label}
            onClick={() => setMain(s.src)}
            className="w-full h-24 object-contain bg-gray-100 rounded-lg cursor-pointer hover:ring-2 hover:ring-red-400 transition p-1"
          />
        ))}
      </div>
    </div>
  );
}
