/**
 * Genera `src/data/box-icons.ts`: el ícono de PC (estilo Gen VIII, del
 * proyecto pokesprite) de cada Pokémon del dataset que lo tiene, junto con el
 * rectángulo que ocupa el Pokémon dentro del lienzo de 68×56.
 *
 * El rectángulo se obtiene descargando cada PNG y buscando los pixeles no
 * transparentes; `PokemonIcon` lo usa para centrar y escalar al Pokémon.
 *
 * pokesprite cubre hasta el #905 y las formas de Alola, Galar e Hisui. Para los
 * que no figuran (Gen IX y formas de Paldea), `PokemonIcon` usa el sprite de
 * PokeAPI, que también se mide (`SPRITE_BOUNDS`).
 *
 * Depende de `src/data/pokemon-data.ts` (correr antes `fetch-pokemon-data.mjs`).
 * Si se cambia `POKESPRITE_COMMIT`, actualizar también el de `src/lib/sprites.ts`.
 *
 * Uso, desde la raíz del proyecto:
 *   node scripts/fetch-box-icons.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

// Rutas relativas a este archivo, no al directorio de trabajo
const DATA = new URL("../src/data/pokemon-data.ts", import.meta.url);
const OUT = new URL("../src/data/box-icons.ts", import.meta.url);

/** Versión fija de pokesprite, para que los íconos no cambien sin aviso. */
const POKESPRITE_COMMIT = "c5aaa610ff2acdf7fd8e2dccd181bca8be9fcb3e";
const REPO_URL = `https://raw.githubusercontent.com/msikma/pokesprite/${POKESPRITE_COMMIT}`;

/** Descargas de PNG en paralelo. */
const CONCURRENCY = 16;

// Lee id y nombre de cada entrada del dataset, sin importar TypeScript
const entries = [
  ...readFileSync(DATA, "utf8").matchAll(/\bid:\s*(\d+),\s*name:\s*"([^"]+)"/g),
].map((m) => ({ id: Number(m[1]), name: m[2] }));
console.log(`${entries.length} Pokémon en el dataset`);

const res = await fetch(`${REPO_URL}/data/pokemon.json`);
if (!res.ok)
  throw new Error(`No se pudo leer el índice de pokesprite (${res.status})`);
const index = await res.json();

// Nombre de cada forma con ícono Gen VIII → nombre de su archivo.
// Las formas marcadas como alias apuntan al archivo de otra forma
// (p. ej. "darmanitan-standard" usa el de "darmanitan").
const files = new Map();
for (const species of Object.values(index)) {
  const slug = species.slug.eng;
  const forms = species["gen-8"]?.forms ?? {};
  const fileOf = (form) => (form === "$" ? slug : `${slug}-${form}`);
  for (const [form, info] of Object.entries(forms)) {
    files.set(fileOf(form), fileOf(info.is_alias_of ?? form));
  }
}

// Variantes del nombre de la API que pokesprite escribe distinto
const candidates = (name) => [name, name.replace(/-(standard|breed)$/, "")];

const icons = {};
const missing = [];
for (const { id, name } of entries) {
  const hit = candidates(name).find((c) => files.has(c));
  if (hit) icons[id] = files.get(hit);
  else missing.push(`${id} ${name}`);
}

/**
 * Rectángulo de los pixeles no transparentes de un PNG sin entrelazado, de
 * 8 bits o con paleta de 1, 2 o 4 bits (los formatos de pokesprite y de los
 * sprites de PokeAPI), como [x, y, ancho, alto].
 */
function opaqueBounds(png) {
  let pos = 8; // salta la firma
  let width = 0;
  let height = 0;
  let colorType = 0;
  let depth = 8;
  let trns = null;
  const idat = [];
  while (pos < png.length) {
    const len = png.readUInt32BE(pos);
    const type = png.toString("ascii", pos + 4, pos + 8);
    const data = png.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8];
      colorType = data[9];
      if (data[12] !== 0 || (depth !== 8 && colorType !== 3))
        throw new Error("PNG no soportado (entrelazado o de 16 bits)");
    } else if (type === "tRNS") trns = data;
    else if (type === "IDAT") idat.push(data);
    pos += 12 + len;
  }

  // Bytes por pixel según el tipo de color: gris, RGB, paleta, gris+alfa, RGBA
  const bpp = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  const alphaOf = (px, x) => {
    const i = x * bpp;
    if (colorType === 6) return px[i + 3];
    if (colorType === 4) return px[i + 1];
    if (colorType === 3) {
      // Con paletas de menos de 8 bits, varios pixeles comparten un byte
      const bit = x * depth;
      const index =
        (px[bit >> 3] >> (8 - depth - (bit & 7))) & ((1 << depth) - 1);
      return trns && index < trns.length ? trns[index] : 255;
    }
    return 255; // sin canal alfa
  };

  // Deshace los filtros de cada fila (especificación PNG, sección 9)
  const raw = inflateSync(Buffer.concat(idat));
  const stride = Math.ceil((width * bpp * depth) / 8);
  let prev = new Uint8Array(stride);
  let x0 = width;
  let y0 = height;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = new Uint8Array(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      let pred = 0;
      if (filter === 1) pred = a;
      else if (filter === 2) pred = b;
      else if (filter === 3) pred = (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[i] = (line[i] + pred) & 0xff;
    }
    for (let x = 0; x < width; x++) {
      if (alphaOf(cur, x) > 0) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        y1 = y;
      }
    }
    prev = cur;
  }
  return x1 < 0 ? [0, 0, width, height] : [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
}

// Descarga cada archivo una sola vez (varias formas pueden compartirlo)
const bounds = new Map();
const queue = [...new Set(Object.values(icons))];
console.log(`Midiendo ${queue.length} íconos...`);
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let file = queue.pop(); file; file = queue.pop()) {
      const r = await fetch(`${REPO_URL}/pokemon-gen8/regular/${file}.png`);
      if (!r.ok)
        throw new Error(`No se pudo descargar ${file}.png (${r.status})`);
      bounds.set(file, opaqueBounds(Buffer.from(await r.arrayBuffer())));
    }
  }),
);

// Los que no tienen ícono usan el sprite de PokeAPI (pixel art de 96×96; los
// de la Gen IX los hizo la comunidad). Se miden igual, para escalarlos parejo.
const SPRITE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const spriteBounds = new Map();
const spriteQueue = missing.map((m) => Number(m.split(" ")[0]));
console.log(`Midiendo ${spriteQueue.length} sprites...`);
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let id = spriteQueue.pop(); id; id = spriteQueue.pop()) {
      const r = await fetch(`${SPRITE_URL}/${id}.png`);
      if (!r.ok)
        throw new Error(`No se pudo descargar el sprite ${id} (${r.status})`);
      spriteBounds.set(id, opaqueBounds(Buffer.from(await r.arrayBuffer())));
    }
  }),
);

/** Rectángulo como "xxyywwhh" (dos dígitos por valor). */
const digits = (box) => box.map((v) => String(v).padStart(2, "0")).join("");

/** "archivo:xxyywwhh". */
const entryOf = (file) => `${file}:${digits(bounds.get(file))}`;

// Formato compacto: las especies 1 a 905 van en orden en un solo texto y las
// formas en un objeto aparte.
const species = [];
for (let id = 1; id <= 905; id++)
  species.push(icons[id] ? entryOf(icons[id]) : "");
const forms = Object.entries(icons)
  .filter(([id]) => Number(id) > 905)
  .map(([id, file]) => `  ${id}: "${entryOf(file)}",`);
const sprites = [...spriteBounds]
  .sort(([a], [b]) => a - b)
  .map(([id, box]) => `  ${id}: "${digits(box)}",`);

writeFileSync(
  OUT,
  `// Archivo generado por scripts/fetch-box-icons.mjs. No editar a mano.
//
// Cada ícono es "archivo:xxyywwhh": el nombre del PNG en pokesprite y el
// rectángulo que ocupa el Pokémon dentro del lienzo de 68×56 (x, y, ancho y
// alto, con dos dígitos cada uno).

/**
 * Íconos de PC de pokesprite (Gen VIII) de las especies 1 a 905, separados
 * por comas y en orden de número. Un lugar vacío indica que no hay ícono.
 */
export const SPECIES_ICONS =
  "${species.join(",")}";

/** Íconos de PC de las formas (ids mayores a 10000) que lo tienen. */
export const FORM_ICONS: Record<number, string> = {
${forms.join("\n")}
};

/**
 * Rectángulo "xxyywwhh" del Pokémon dentro de su sprite de PokeAPI (96×96),
 * para los que no tienen ícono de PC (Gen IX y formas de Paldea).
 */
export const SPRITE_BOUNDS: Record<number, string> = {
${sprites.join("\n")}
};
`,
);

const total = species.filter(Boolean).length + forms.length;
console.log(`${total} con ícono, ${missing.length} con sprite:`);
console.log(missing.join(", "));
