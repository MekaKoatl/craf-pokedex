import { Link } from "react-router-dom";
import { getRegionalDisplayName } from "../../lib/regional";
import { PokemonIcon } from "../PokemonIcon";

/**
 * Ícono y nombre de un Pokémon con link a su página.
 *
 * Está separado de `RowParts` porque importa `pokemon-data` (~138 kB) a
 * través de `getRegionalDisplayName`; así Items no lo descarga.
 */
export function PokemonLink({ id, name }: { id: number; name: string }) {
  return (
    <Link
      to={`/details/${id}`}
      className="flex flex-col items-center gap-0.5 p-1 rounded hover:bg-white transition"
    >
      <PokemonIcon id={id} size={48} />
      <span className="text-[0.6rem] text-gray-500 text-center leading-tight">
        {getRegionalDisplayName(name)}
      </span>
    </Link>
  );
}
