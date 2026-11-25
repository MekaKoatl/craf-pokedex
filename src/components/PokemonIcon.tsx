import { SpriteImg } from "./SpriteImg";
import {
  boxIconBounds,
  boxIconUrl,
  pokemonSpriteUrl,
  spriteBounds,
  type IconBounds,
} from "../lib/sprites";

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

/**
 * Cuántas veces más grande se dibuja un Pokémon en los sprites de PokeAPI que
 * en los íconos de PC (el típico mide unos 65 px contra 28). Sirve para
 * llevarlos a la misma escala.
 */
const SPRITE_DETAIL = 65 / 28;

type Props = {
  id: number;
  /** Lado del casillero cuadrado que ocupa el ícono, en px. */
  size?: number;
  className?: string;
};

/** Imagen a mostrar y dónde está el Pokémon dentro de ella. */
type Source = {
  src: string;
  /** Lienzo de la imagen, en px. */
  width: number;
  height: number;
  bounds: IconBounds;
  /** Escala del dibujo respecto de los íconos de PC (1 = igual). */
  detail: number;
  /** Mantener los pixeles nítidos al escalar. */
  pixelated: boolean;
};

/** Ícono de PC si existe; si no, el sprite de PokeAPI medido. */
function sourceOf(id: number): Source | undefined {
  const box = boxIconBounds(id);
  if (box) {
    return {
      src: boxIconUrl(id),
      width: 68,
      height: 56,
      bounds: box,
      detail: 1,
      pixelated: true,
    };
  }
  const sprite = spriteBounds(id);
  if (sprite) {
    return {
      src: pokemonSpriteUrl(id),
      width: 96,
      height: 96,
      bounds: sprite,
      detail: SPRITE_DETAIL,
      // Se achican a menos de la mitad: suavizados se ven más parejos
      pixelated: false,
    };
  }
  return undefined;
}

/**
 * Ícono de un Pokémon centrado en un casillero cuadrado de `size` px.
 *
 * Usa el ícono de PC de pokesprite (estilo Gen VIII) y, para los que no lo
 * tienen (Gen IX y formas de Paldea), el sprite pixelado de PokeAPI.
 *
 * Cada Pokémon se dibuja de un tamaño distinto (en pokesprite, los rediseñados
 * en Sword/Shield son más grandes). Para que se note la diferencia sin que se
 * vea desordenado, se suaviza: el lado mayor del Pokémon (medido en
 * `src/data/box-icons.ts`) se lleva a la escala descripta arriba y se centra
 * en el casillero. El lienzo sobrante se compensa con márgenes negativos.
 */
export function PokemonIcon({ id, size = 40, className = "" }: Props) {
  const source = sourceOf(id);
  if (!source) {
    // Sin medidas (dataset más nuevo que box-icons.ts): sprite entero
    return (
      <SpriteImg
        src={pokemonSpriteUrl(id)}
        alt=""
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const { bounds: box } = source;
  const longest = Math.max(box.w, box.h);
  const shown = Math.min(
    MAX,
    Math.max(MIN, SHOWN * (longest / source.detail / TYPICAL) ** CURVE),
  );
  const scale = (shown / longest) * (size / 40);
  const w = source.width * scale;
  const h = source.height * scale;
  // Desplazamiento para que el centro del Pokémon caiga en el del casillero
  const left = size / 2 - (box.x + box.w / 2) * scale;
  const top = size / 2 - (box.y + box.h / 2) * scale;
  return (
    <SpriteImg
      src={source.src}
      alt=""
      className={`max-w-none ${className}`}
      style={{
        width: w,
        height: h,
        margin: `${top}px ${size - w - left}px ${size - h - top}px ${left}px`,
        imageRendering: source.pixelated ? "pixelated" : undefined,
      }}
    />
  );
}
