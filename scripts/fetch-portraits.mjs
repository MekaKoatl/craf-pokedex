/**
 * Genera `public/portraits/<id>.webp`: un retrato cuadrado (zoom al arte
 * oficial) de cada Pokémon del dataset que no tiene ícono de PC en pokesprite
 * (Gen IX y formas de Paldea). `PokemonIcon` lo muestra recortado en círculo.
 *
 * El encuadre es automático: un zoom ligero (`ZOOM`) centrado en el Pokémon,
 * es decir, en el centro del rectángulo que ocupan sus pixeles opacos.
 *
 * Depende de `src/data/pokemon-data.ts` y `src/data/box-icons.ts` (correr
 * antes `fetch-pokemon-data.mjs` y `fetch-box-icons.mjs`). Usa `sharp`
 * (dependencia de desarrollo) para recortar y convertir las imágenes.
 *
 * Uso, desde la raíz del proyecto:
 *   node scripts/fetch-portraits.mjs
 */
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Rutas relativas a este archivo, no al directorio de trabajo
const DATA = new URL("../src/data/pokemon-data.ts", import.meta.url);
const ICONS = new URL("../src/data/box-icons.ts", import.meta.url);
const OUT_DIR = new URL("../public/portraits/", import.meta.url);

const ARTWORK_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

/** Lado del retrato en px (el doble del casillero más grande, para pantallas de alta densidad). */
const SIZE = 96;
/**
 * Parte del lado mayor del Pokémon que entra en el retrato: 1 = entero,
 * menos de 1 = más cerca (los bordes quedan fuera del círculo).
 */
const ZOOM = 0.85;
/** Alfa mínimo para considerar un pixel parte del Pokémon. */
const ALPHA_MIN = 40;
/** Descargas en paralelo. */
const CONCURRENCY = 8;

// Ids del dataset y los que tienen ícono de PC (desde los archivos generados)
const ids = [
  ...readFileSync(DATA, "utf8").matchAll(/\bid:\s*(\d+),\s*name:/g),
].map((m) => Number(m[1]));
const icons = readFileSync(ICONS, "utf8");
const species = icons.match(/SPECIES_ICONS =\s*"([^"]*)"/)[1].split(",");
const forms = new Set([...icons.matchAll(/^\s+(\d+): "/gm)].map((m) => Number(m[1])));
const hasIcon = (id) => (id <= species.length ? !!species[id - 1] : forms.has(id));
const pending = ids.filter((id) => !hasIcon(id));
console.log(`${pending.length} Pokémon sin ícono de PC`);

/**
 * Centro y lado del recorte (en px de la imagen original): el centro del
 * rectángulo de pixeles opacos y `ZOOM` veces su lado mayor.
 */
function frame(mask, width, height) {
  let top = height;
  let bottom = -1;
  let left = width;
  let right = -1;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (mask[y * width + x]) {
        if (y < top) top = y;
        bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
  const longest = Math.max(bottom - top, right - left);
  return {
    cx: (left + right) / 2,
    cy: (top + bottom) / 2,
    side: Math.floor(longest * ZOOM),
  };
}

/** Descarga el arte oficial de un id y guarda su retrato. */
async function portrait(id) {
  const res = await fetch(`${ARTWORK_URL}/${id}.png`);
  if (!res.ok) throw new Error(`No se pudo descargar el arte de ${id} (${res.status})`);
  const { data, info } = await sharp(Buffer.from(await res.arrayBuffer()))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  const mask = new Uint8Array(width * height);
  for (let i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3] > ALPHA_MIN ? 1 : 0;
  const { cx, cy, side } = frame(mask, width, height);

  // Copia el recorte a un lienzo transparente (puede salirse de la imagen)
  const x0 = Math.floor(cx - side / 2);
  const y0 = Math.floor(cy - side / 2);
  const out = Buffer.alloc(side * side * 4);
  for (let y = 0; y < side; y++)
    for (let x = 0; x < side; x++) {
      const sx = x0 + x;
      const sy = y0 + y;
      if (sx < 0 || sy < 0 || sx >= width || sy >= height) continue;
      data.copy(out, (y * side + x) * 4, (sy * width + sx) * 4, (sy * width + sx) * 4 + 4);
    }

  await sharp(out, { raw: { width: side, height: side, channels: 4 } })
    .resize(SIZE, SIZE, { kernel: "lanczos3" })
    .webp({ quality: 85 })
    .toFile(fileURLToPath(new URL(`${id}.webp`, OUT_DIR)));
}

mkdirSync(OUT_DIR, { recursive: true });
const queue = [...pending];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let id = queue.shift(); id; id = queue.shift()) await portrait(id);
  }),
);
console.log(`${pending.length} retratos guardados en public/portraits/`);