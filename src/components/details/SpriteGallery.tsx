import { useState } from "react";
import type { PokemonFull } from "../../types/pokemon";
import { cdnSprite, boxIconUrl, hasBoxIcon } from "../../lib/sprites";
import { ImageModal } from "./ImageModal";
import { SpriteImg } from "../SpriteImg";

// Atajos a los seis lugares donde viven los sprites
function parts(p?: PokemonFull | null) {
  return {
    s: p?.sprites,
    art: p?.sprites.other?.["official-artwork"],
    home: p?.sprites.other?.["home"],
    anim: p?.sprites.versions?.["generation-v"]?.["black-white"]?.animated,
    show: p?.sprites.other?.["showdown"],
    dream: p?.sprites.other?.["dream_world"],
  };
}

export function SpriteGallery({
  pokemon,
  female,
}: {
  pokemon: PokemonFull;
  female?: PokemonFull | null;
}) {
  const m = parts(pokemon);
  const w = parts(female);

  // Cada hueco ♀ se resuelve de dos maneras: con el campo _female del
  // propio Pokémon (Pyroar) o con el sprite de la variedad hembra
  // (Meowstic). El ?? toma el que exista.
  const sprites = [
    { src: m.art?.front_default, label: "Artwork" },
    { src: w.art?.front_default, label: "Artwork ♀" },
    { src: m.home?.front_default, label: "Home" },
    { src: m.home?.front_female ?? w.home?.front_default, label: "Home ♀" },
    { src: m.dream?.front_default, label: "Dream World" },
    {
      src: m.dream?.front_female ?? w.dream?.front_default,
      label: "Dream World ♀",
    },
    { src: m.s?.front_default, label: "Front" },
    { src: m.s?.back_default, label: "Back" },
    { src: m.s?.front_female ?? w.s?.front_default, label: "Front ♀" },
    { src: m.s?.back_female ?? w.s?.back_default, label: "Back ♀" },
    { src: m.anim?.front_default, label: "Front Animated" },
    { src: m.anim?.back_default, label: "Back Animated" },
    {
      src: m.anim?.front_female ?? w.anim?.front_default,
      label: "Front Animated ♀",
    },
    {
      src: m.anim?.back_female ?? w.anim?.back_default,
      label: "Back Animated ♀",
    },
    { src: m.show?.front_default, label: "Showdown" },
    { src: m.show?.back_default, label: "Showdown Back" },
    {
      src: m.show?.front_female ?? w.show?.front_default,
      label: "Showdown ♀",
    },
    {
      src: m.show?.back_female ?? w.show?.back_default,
      label: "Showdown Back ♀",
    },

    { src: m.art?.front_shiny, label: "Artwork Shiny" },
    { src: w.art?.front_shiny, label: "Artwork Shiny ♀" },
    { src: m.home?.front_shiny, label: "Home Shiny" },
    {
      src: m.home?.front_shiny_female ?? w.home?.front_shiny,
      label: "Home Shiny ♀",
    },
    { src: m.s?.front_shiny, label: "Shiny" },
    { src: m.s?.back_shiny, label: "Back Shiny" },
    { src: m.s?.front_shiny_female ?? w.s?.front_shiny, label: "Shiny ♀" },
    { src: m.s?.back_shiny_female ?? w.s?.back_shiny, label: "Back Shiny ♀" },
    { src: m.show?.front_shiny, label: "Showdown Shiny" },
    { src: m.show?.back_shiny, label: "Showdown Back Shiny" },
    {
      src: m.show?.front_shiny_female ?? w.show?.front_shiny,
      label: "Showdown Shiny ♀",
    },
    {
      src: m.show?.back_shiny_female ?? w.show?.back_shiny,
      label: "Showdown Back Shiny ♀",
    },

    {
      src: hasBoxIcon(pokemon.id) ? boxIconUrl(pokemon.id) : null,
      label: "Box Icon",
    },
    {
      src: female && hasBoxIcon(female.id) ? boxIconUrl(female.id) : null,
      label: "Box Icon ♀",
    },
  ]
    .map((s) => ({ ...s, src: cdnSprite(s.src) }))
    .filter((s): s is { src: string; label: string } => Boolean(s.src));

  const uniqueSprites = sprites.filter(
    (s, i, arr) => arr.findIndex((x) => x.src === s.src) === i,
  );

  const artwork =
    cdnSprite(m.art?.front_default) || cdnSprite(m.s?.front_default) || "";
  const [main, setMain] = useState(artwork);

  return (
    <div className="mb-8">
      {/* Imagen principal */}
      <div className="bg-gray-100 rounded-xl flex items-center justify-center min-h-[320px] relative">
        <SpriteImg
          src={main}
          alt={pokemon.name}
          className="w-72 h-72 object-contain"
        />
        <ImageModal src={main} alt={pokemon.name} />
      </div>

      {/* Selector horizontal: con un solo sprite no tiene sentido */}
      {uniqueSprites.length > 1 && (
        <div className="sprite-strip mt-3 flex gap-2 overflow-x-auto pb-2">
          {uniqueSprites.map((s) => (
            <button
              key={s.src}
              onClick={() => setMain(s.src)}
              title={s.label}
              className={`flex-none w-20 h-20 rounded-lg bg-gray-100 p-1 border-2 transition cursor-pointer ${
                main === s.src
                  ? "border-red-500"
                  : "border-transparent hover:border-red-300"
              }`}
            >
              <SpriteImg
                src={s.src}
                alt={s.label}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
