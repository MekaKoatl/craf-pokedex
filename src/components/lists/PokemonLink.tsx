import { Link } from "react-router-dom";
import { SpriteImg } from "../SpriteImg";
import { iconOrSprite } from "../../lib/sprites";
import { getRegionalDisplayName } from "../../lib/regional";

// Va en su propio archivo porque usa los datos de todos los Pokémon
// (pokemon-data, ~138 kB): así Items no los descarga sin necesidad.
// Ícono + nombre de un Pokémon que lleva a su página
export function PokemonLink({ id, name }: { id: number; name: string }) {
  return (
    <Link
      to={`/details/${id}`}
      className="flex flex-col items-center gap-0.5 p-1 rounded hover:bg-white transition"
    >
      <SpriteImg
        src={iconOrSprite(id)}
        alt=""
        className="w-12 h-12 object-contain"
        style={{ imageRendering: "pixelated" }}
      />
      <span className="text-[0.6rem] text-gray-500 text-center leading-tight">
        {getRegionalDisplayName(name)}
      </span>
    </Link>
  );
}