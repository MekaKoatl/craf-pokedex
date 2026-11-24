import { SpriteImg } from "./SpriteImg";
import { boxIconBounds, boxIconUrl, pokemonSpriteUrl } from "../lib/sprites";

/** Lienzo de los íconos de pokesprite, en px. */
const ICON_W = 68;
const ICON_H = 56;

/**
 * Escala de tamaños, para un casillero de 40 px: el Pokémon de tamaño típico
 * (`TYPICAL` px de lado en su ícono) se muestra a `SHOWN` px. Los demás se
 * agrandan o achican según `CURVE` (1 = tamaño real, 0 = todos iguales) y
 * quedan entre `MIN` y `MAX` px.
 */
const TYPICAL = 28;
const SHOWN = 32;
const CURVE = 0.4;
const MIN = 24;
const MAX = 40;

type Props = {
  id: number;
  /** Lado del casillero cuadrado que ocupa el ícono, en px. */
  size?: number;
  className?: string;
};

/**
 * Ícono de PC de un Pokémon (pokesprite, estilo Gen VIII) centrado en un
 * casillero cuadrado de `size` px.
 *
 * En pokesprite cada Pokémon tiene un tamaño distinto (los rediseñados en
 * Sword/Shield son más grandes). Para que se note la diferencia sin que se vea
 * desordenado, se suaviza: el lado mayor del Pokémon (según
 * `src/data/box-icons.ts`) se lleva a la escala descripta arriba y se centra
 * en el casillero. El lienzo sobrante se compensa con márgenes negativos.
 * Sin ícono (Gen IX y formas de Paldea), muestra el sprite normal.
 */
export function PokemonIcon({ id, size = 40, className = "" }: Props) {
  const box = boxIconBounds(id);
  if (!box) {
    return (
      <SpriteImg
        src={pokemonSpriteUrl(id)}
        alt=""
        className={`object-contain ${className}`}
        style={{ width: size, height: size, imageRendering: "pixelated" }}
      />
    );
  }

  const longest = Math.max(box.w, box.h);
  const shown = Math.min(
    MAX,
    Math.max(MIN, SHOWN * (longest / TYPICAL) ** CURVE),
  );
  const scale = (shown / longest) * (size / 40);
  const w = ICON_W * scale;
  const h = ICON_H * scale;
  // Desplazamiento para que el centro del Pokémon caiga en el del casillero
  const left = size / 2 - (box.x + box.w / 2) * scale;
  const top = size / 2 - (box.y + box.h / 2) * scale;
  return (
    <SpriteImg
      src={boxIconUrl(id)}
      alt=""
      className={`max-w-none ${className}`}
      style={{
        width: w,
        height: h,
        margin: `${top}px ${size - w - left}px ${size - h - top}px ${left}px`,
        imageRendering: "pixelated",
      }}
    />
  );
}
