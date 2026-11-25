# MekaDragon's Pokédex (craf-pokedex)

🇪🇸 Español · [🇬🇧 English](README.en.md)

Una Pokédex web hecha con React sobre la [PokéAPI](https://pokeapi.co): búsqueda y filtros, una página completa para cada Pokémon, tablas de objetos, habilidades y movimientos, favoritos, listas propias y un planificador de equipos por juego. Se publica en Vercel desde la rama `main`.

Este README es para quien vaya a trabajar en el código: cómo correrlo, cómo está organizado, de dónde salen los datos y qué tener en cuenta.

---

## Contenido

1. [Correr el proyecto](#correr-el-proyecto)
2. [Stack](#stack)
3. [Páginas y rutas](#páginas-y-rutas)
4. [Estructura de carpetas](#estructura-de-carpetas)
5. [Datos: locales y de la API](#datos-locales-y-de-la-api)
6. [Scripts de datos](#scripts-de-datos)
7. [Qué se guarda en el navegador](#qué-se-guarda-en-el-navegador)
8. [Convenciones](#convenciones)
9. [Notas técnicas](#notas-técnicas)
10. [Pendientes](#pendientes)

---

## Correr el proyecto

Hace falta **Node 20.19 o superior** (Vite 8 no funciona en versiones anteriores).

```bash
npm install       # una sola vez
npm run dev       # servidor de desarrollo (http://localhost:5173)
npm run build     # chequeo de TypeScript + build de producción en dist/
npm run preview   # sirve el build de dist/ para probarlo
npm run lint      # ESLint
```

`npm run build` falla si hay variables o imports sin usar (`noUnusedLocals` está activo). Correrlo antes de cada commit.

**Deploy:** Vercel hace el build automáticamente con cada push a `main`. `vercel.json` redirige todas las rutas a `index.html`, así funcionan los links directos como `/details/25`.

## Stack

| Herramienta                    | Para qué se usa                                  |
| ------------------------------ | ------------------------------------------------ |
| Vite 8 + React 19 + TypeScript | base del proyecto                                |
| React Router 7                 | rutas y navegación                               |
| TanStack Query 5               | pedidos a la PokéAPI con caché                   |
| Tailwind CSS 4                 | estilos, junto con CSS propio en `src/index.css` |
| PokéAPI + sprites en jsDelivr  | datos e imágenes                                 |
| pokesprite (jsDelivr)          | íconos de PC de los Pokémon                      |
| Web3Forms                      | envía el formulario de Feedback por mail         |

## Páginas y rutas

| Ruta                                      | Página                       | Qué hace                                                                                                                                                           |
| ----------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                                       | `Home`                       | Pokémon del día (adivinar o revelar), tira animada de íconos y búsqueda rápida                                                                                     |
| `/dxg`                                    | `DexGallery`                 | Galería completa con búsqueda, filtros y "Load More"                                                                                                               |
| `/dex-stats`                              | `DexStats`                   | Tabla de stats base, ordenable por cualquier columna (solo datos locales)                                                                                          |
| `/details/:id`                            | `Details`                    | Página completa: sprites, tipos, efectividades, evoluciones, formas, movimientos y más. `?gender=female` muestra la forma hembra. Un id inexistente muestra un 404 |
| `/items`                                  | `Items`                      | Tabla de objetos con búsqueda, categorías y letras A–Z                                                                                                             |
| `/abilities`                              | `Abilities`                  | Tabla de habilidades; `?open=<nombre>` abre una directamente                                                                                                       |
| `/moves`                                  | `Moves`                      | Tabla de movimientos con filtros de tipo y categoría                                                                                                               |
| `/favorites`                              | `Favorites`                  | Favoritos, con buscador para agregar más y filtros                                                                                                                 |
| `/lists` · `/lists/:listId`               | `Lists` · `ListDetail`       | Listas propias (hasta 20)                                                                                                                                          |
| `/team-planner` · `/team-planner/:teamId` | `TeamPlanner` · `TeamEditor` | Equipos por juego (hasta 30): análisis, stats, exportar e importar en formato Showdown                                                                             |
| `/backup`                                 | `Backup`                     | Exporta favoritos, listas y equipos a un `.json` y los importa en otro dispositivo                                                                                 |
| `/faq`                                    | `FAQ`                        | Preguntas frecuentes                                                                                                                                               |
| `/disclaimer`                             | `Disclaimer`                 | Aviso legal y agradecimientos                                                                                                                                      |
| `/feedback`                               | `Feedback`                   | Formulario para enviar comentarios por mail                                                                                                                        |
| `*`                                       | `NotFound`                   | 404 para cualquier otra ruta                                                                                                                                       |

`Home` se carga de entrada. Las demás páginas se descargan la primera vez que se visitan (`lazy` en `src/App.tsx`). El pie de página tiene los links a FAQ, Disclaimer y Feedback.

## Estructura de carpetas

```
scripts/                  Scripts de Node que generan los archivos de src/data
src/
  App.tsx                 Estructura (Navbar, rutas, Footer) y páginas con lazy
  main.tsx                Providers: Query > Favorites > Lists > Teams > Router
  index.css               Tailwind + CSS propio (botones, tarjetas, tablas, filtros, celular)
  assets/                 Imágenes propias (fondo1.webp, pokeball1.webp, íconos de categoría)
  data/                   Generados por los scripts. No editar a mano.
  types/                  Tipos de TypeScript de la API (pokemon, move, item, ability)
  lib/                    Funciones puras, sin React: API, reglas, cálculos, texto
  hooks/                  Hooks propios (datos, filtros, estado de listas, pantalla)
  context/                Estado global guardado en localStorage
  components/
    badges/               TypeBadge, FormBadge, CategoryBadge
    filters/              FilterBar, FilterPanel, FilterPill
    details/              Las secciones de la página Details
    items/ abilities/ moves/   La fila de cada tabla (cerrada y abierta)
    lists/                Piezas comunes a las tres tablas: LetterStrip, RowParts, PokemonLink
    collection/           Piezas comunes a Lists y Team Planner: barra, tarjeta seleccionable, renombrar
    team/                 Todo lo del Team Planner
     (sueltos)             DexCard, Navbar, Footer, SearchBar, SpriteImg, PokemonIcon,
                          AddToListButton, LoadMoreButton, NotFoundMessage...
  pages/                  Una por ruta
```

Los archivos más importantes de `src/lib`:

| Archivo           | Qué tiene                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------- | ------------------------------------------------------ | --------------- |
| `api.ts`          | Todos los pedidos a la PokéAPI. `getPokemonFull` lanza `NotFoundError` ante un 404                                     |
| `sprites.ts`      | URLs de imágenes: `cdnSprite`, íconos de pokesprite y sus medidas, sprites, arte oficial, Dream World, arte de objetos |                       | `regional.ts` | Nombres visibles ("Alolan Raichu") y formas regionales |
| `evolution.ts`    | Recorrido de la cadena evolutiva y armado de los requisitos                                                            |
| `dexOrder.ts`     | Número de Pokédex (las formas regionales usan el de su especie) y orden                                                |
| `games.ts`        | Lista de juegos, qué tiene cada uno, colores de las etiquetas y qué imagen usar                                        |
| `teamRules.ts`    | Reglas por juego: habilidades, movimientos, objetos, Megas, naturalezas y fórmulas de stats                            |
| `typeChart.ts`    | Tabla de tipos por generación y habilidades que cambian el daño                                                        |
| `teamTransfer.ts` | Pasar miembros a otro juego quitando lo que ahí no es válido (Duplicate e Import)                                      |
| `showdown.ts`     | Exportar e importar el formato de texto de Pokémon Showdown                                                            |
| `box-icons.ts`    | Ícono de pokesprite de cada Pokémon y dónde está dibujado; medidas de los sprites de la Gen IX                         | `fetch-box-icons.mjs` |               | `daily.ts`                                             | Pokémon del día |

Hooks compartidos que conviene conocer:

| Hook                              | Qué hace                                                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useListControls`                 | Estado de las tablas de Items, Abilities y Moves: búsqueda, letra, orden por columna, fila abierta. Viene con `filterAndSort`, `byName` y `byMap` |
| `usePagedList`                    | Pagina una lista de nombres ya filtrada y ordenada, pidiendo de a 30                                                                              |
| `useSelection`                    | Modo selección (marcar, marcar todos, borrar en lote) de listas y equipos                                                                         |
| `useTeamDefense` / `useTeamForms` | Defensa del equipo por tipo y datos de cada miembro (incluida su Mega)                                                                            |
| `useIsMobile` / `useMediaQuery`   | Condiciones de pantalla que se actualizan al cambiar el tamaño                                                                                    |

## Datos: locales y de la API

Hay dos fuentes:

- **Datos locales (`src/data/`).** Los generan los scripts y van dentro del build. Se usan para todo lo que tiene que ser instantáneo o se lee en bloque: filtros, búsqueda, la caja del Team Planner y la tabla de stats.
- **PokéAPI.** Todo lo demás se pide cuando hace falta y queda en la caché de TanStack Query: datos completos de cada Pokémon, movimientos, objetos, habilidades, especies y cadenas evolutivas.

| Archivo            | Qué contiene                                                                                                        | Script                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `pokemon-data.ts`  | 1082 entradas (1025 especies + formas regionales): nombre, tipos, región, insignias de forma, si es evolución final | `fetch-pokemon-data.mjs` |
| `pokemon-stats.ts` | Los 6 stats base de cada entrada                                                                                    | `fetch-stats.mjs`        |
| `pokemon-games.ts` | Qué Pokémon hay en cada grupo de juegos                                                                             | `fetch-games.mjs`        |
| `regional-dex.ts`  | La Pokédex regional de cada juego, en orden                                                                         | `fetch-regional-dex.mjs` |
| `box-icons.ts`     | Ícono de pokesprite de cada Pokémon y dónde está dibujado; medidas de los sprites de la Gen IX                      | `fetch-box-icons.mjs`    |

## Scripts de datos

Se corren desde la raíz del proyecto, por ejemplo `node scripts/fetch-stats.mjs`. Cada uno pide los datos a la PokéAPI y reescribe su archivo en `src/data/`. Pueden tardar varios minutos. El encabezado de cada script dice qué genera y de qué depende.

**Orden:** `fetch-stats`, `fetch-games` y `fetch-box-icons` leen `pokemon-data.ts`, así que cada vez que ese archivo cambie hay que correrlos en este orden:

1. `fetch-pokemon-data.mjs`. Al terminar muestra qué se agregó, quitó o cambió respecto del archivo anterior.
2. `fetch-stats.mjs`
3. `fetch-games.mjs`
4. `fetch-box-icons.mjs`

`fetch-regional-dex.mjs` y `fetch-items.mjs` no dependen de nada; se corren cuando haga falta (por ejemplo, cuando sale un juego nuevo).

## Qué se guarda en el navegador

Todo vive en `localStorage`; no hay servidor ni cuentas. Los datos no se sincronizan solos entre dispositivos: la página Backup (`/backup`, lógica en `lib/backup.ts`) exporta favoritos, listas y equipos a un `.json` y lo importa en otro dispositivo, combinando o reemplazando lo que hay.

| Clave              | Qué guarda                              | Dónde se maneja                  |
| ------------------ | --------------------------------------- | -------------------------------- |
| `craf-favorites`   | ids de favoritos                        | `context/FavoritesContext.tsx`   |
| `craf-lists`       | listas `{ id, name, pokemon[] }`        | `context/ListsContext.tsx`       |
| `craf-teams`       | equipos `{ id, name, game, members[] }` | `context/TeamsContext.tsx`       |
| `craf-wtp-<fecha>` | resultado del Pokémon del día           | `components/WhosThatPokemon.tsx` |

Si cambia la forma de los datos guardados, los datos viejos tienen que seguir funcionando. Por ejemplo, `level`, `evs` e `ivs` de `TeamMember` son opcionales porque los equipos guardados antes no los tienen.

## Convenciones

**Código**

- La interfaz está en inglés; los comentarios del código, en español.
- **Los comentarios documentan cómo funciona el código**, no cómo funciona React ni qué cambió. Cada función, hook, componente, tipo y constante exportada tiene un bloque JSDoc (`/** ... */`) que VS Code muestra al pasar el mouse; los comentarios `//` dentro del código son solo para decisiones que no son obvias.
- Formato: Prettier con su configuración por defecto.
- Exports con nombre (`export function Details`), no `export default`. Por eso `App.tsx` usa `lazy(() => import(...).then((m) => ({ default: m.Details })))`.
- Los hooks van **antes** de cualquier `return` temprano.
- Para reiniciar un estado cuando cambia un valor (por ejemplo, cerrar un menú al cambiar de ruta), se compara con el valor anterior durante el render en lugar de llamar a `setState` dentro de un `useEffect`. Ver `Navbar.tsx`.
- Todo sprite de la PokéAPI pasa por `cdnSprite()` o se arma con las funciones de `sprites.ts` (ver notas técnicas).
- Para mostrar sprites se usa `SpriteImg`: muestra el Unown de carga, reintenta desde GitHub si falla jsDelivr y descarga la imagen recién cuando está cerca de la pantalla (`loading="lazy"`).
- Para íconos de Pokémon en tarjetas, grillas y buscadores se usa `PokemonIcon` (ver notas técnicas).
- Botones: `btn-primary` (rojo) y `btn-ghost` (píldora blanca) en `index.css` definen colores y estados; el tamaño, el padding y el borde redondeado van en cada uso con clases de Tailwind.
- Una página nueva se agrega en `App.tsx` con `lazy`, y en `Navbar.tsx` o `Footer.tsx`.

**Celular** (el corte es `sm:`, 640px)

- Todo lo que se toca mide al menos **45px**: `min-h-[45px] sm:min-h-0`. Cuando no entra, se agranda el área táctil sin cambiar el aspecto, con `after:absolute after:-inset-[...]`.
- Los inputs y selects usan letra de **16px** en celular (`text-base sm:text-sm`). Con menos, iOS hace zoom al tocarlos.
- Los efectos hover van dentro de `@media (hover: hover)`, porque en el celular el hover queda activo después de tocar. El `hover:` de Tailwind 4 ya lo hace.
- Para saber desde React si es un celular: `useIsMobile()`; para cualquier otra condición, `useMediaQuery()`. No llamar a `window.matchMedia` directamente durante el render: no se entera de los cambios.

## Notas técnicas

**Imágenes**

- **jsDelivr, no GitHub.** Los sprites de `raw.githubusercontent.com` devolvían 429 (demasiados pedidos). `cdnSprite()` cambia esas URLs por las de jsDelivr. Si una imagen de jsDelivr falla, `SpriteImg` la vuelve a pedir una vez a GitHub antes de llamar a su `onError`.
- **Íconos de Pokémon (`PokemonIcon`):** usan los íconos de PC de [pokesprite](https://github.com/msikma/pokesprite) (estilo Gen VIII, en una versión fija de jsDelivr), que cubren hasta el #905 y las formas de Alola, Galar e Hisui. Para la Gen IX y las formas de Paldea se usa el sprite de PokeAPI (pixel art hecho por la comunidad). `fetch-box-icons` mide dónde está dibujado cada Pokémon, y `PokemonIcon` lo centra y lo escala con una curva suave: los grandes se ven más grandes, sin saltos bruscos (`CURVE` en `PokemonIcon.tsx`).- **Juegos de Switch** (`ARTWORK_GROUPS` en `games.ts`): los casilleros del editor de equipos y el panel del miembro usan arte oficial en lugar de sprites pixelados. Las tarjetas y la caja usan `PokemonIcon` en todos los juegos.- **Tarjetas en celular:** usan el dibujo de Dream World (SVG). Si no existe para ese Pokémon, `onError` pasa al arte oficial. Las tarjetas de Regional Forms dentro de Details quedan pixeladas (`<DexCard pixel />`).
- **No hay arte oficial de hembra.** `official-artwork` no tiene versión hembra; la galería completa los lugares ♀ con el campo `_female` o con la variedad hembra.
- **Arte de objetos:** la fila abierta de un objeto prueba `itemArtUrls()` en orden (gen9 → gen8 → Dream World) y, si fallan todas, usa el sprite pixelado.

**Pokémon y formas**

- **Formas regionales:** están en `pokemon-data.ts` con `isRegional: true` y nombres como `raichu-alola` o `tauros-paldea-combat-breed`. Se detectan por el sufijo al final **o en el medio** del nombre.
- **Nombres por defecto.** Algunos Pokémon traen la forma en el nombre de la API (`mimikyu-disguised`). `DEFAULT_FORMS` en `regional.ts` los muestra limpios.
- **Cadena evolutiva y formas regionales.** Usa `required_pokemon_form` y `evolved_pokemon_form` de cada `evolution_detail`. Una vía sin forma requerida aplica solo a la forma normal.
- **Variedades de género.** Details muestra una página por especie: el id de la hembra redirige a la especie con `?gender=female`, y `shown` decide de dónde salen stats, habilidades y medidas.
- **Pokémon que no existe.** `getPokemonFull` lanza `NotFoundError` ante un 404 y `usePokemonDetails` no lo reintenta, así Details muestra el 404 de inmediato. Los demás errores (de red) se reintentan hasta 3 veces.
- **Pokémon del día.** `daily.ts` baraja los 1025 ids con una semilla por año y separa los números cercanos: no se repite en el año ni hay números parecidos en la misma semana.

**Tablas y listas**

- **Items, Abilities y Moves comparten sus piezas:** `useListControls` (estado), `usePagedList` (paginación), `LetterStrip`, `LoadMoreButton` y `RowParts` (botón de cierre, texto y efecto, grilla de datos). También comparten el CSS: `.item-table`, `.ability-table` y `.move-table` tienen las mismas reglas y solo cambian sus columnas.
- **Clave de caché de las listas paginadas.** `usePagedList` recibe los nombres y una clave corta. Todo lo que cambia la lista (búsqueda, filtro, letra, orden) tiene que estar en esa clave; si no, se muestra la caché vieja.
- **El orden abarca toda la lista,** no solo lo cargado: se ordena antes de paginar.
- **Mapas diferidos** (`useItemCategoryMap`, `useAbilityGenMap`, `useMoveTypeMap`, `useMoveCategoryMap`): se piden solo al ordenar por esa columna.
- **La columna Pokémon de Abilities no ordena,** porque esa cantidad solo viene en el detalle de cada habilidad.
- **Lists y Team Planner comparten** `useSelection`, `CollectionToolbar`, `SelectableCard`, `RenameForm` y `sortCollection`.

**Team Planner**

- **Por juego, no por generación:** Ruby y Omega Ruby son juegos distintos. `gameFeatures()` dice qué existe en cada uno (habilidades, objetos, naturalezas, tipo Hada); lo que no existe no se muestra.
- **Fiel a cada juego:** las habilidades usan `past_abilities` y los movimientos `past_values` (lo que cambió después de ese juego). Hasta la Gen III, físico o especial depende del tipo. La tabla de tipos cambia según la generación (particularidades de la Gen I; Acero resistía Fantasma y Siniestro antes de la Gen VI).
- **Megas:** la Megapiedra se reconoce por las primeras 5 letras de la especie, y solo para especies con la insignia `M` (si no, Pidgey "tendría" Pidgeotite).
- **Stats:** fórmulas de la Gen III en adelante; nivel 50 por defecto. Antes de la Gen III solo se muestran los stats base.
- **Análisis defensivo:** ×2 resta 1, ×4 resta 2, ×½ suma 1, ×¼ o inmune suma 2. Lo calcula `useTeamDefense`, compartido por Team Analysis y el filtro "Covers weaknesses".
- **Duplicate e Import** pasan por `transferMembers()`, que quita lo que no es válido en el juego elegido y devuelve los avisos a mostrar.
- **Showdown:** sin `Level:`, Showdown usa nivel 100. Las Megas se importan como la especie normal con su Megapiedra.
- **Reordenar:** arrastrando con mouse; con flechas en pantallas táctiles (`useMediaQuery("(pointer: fine)")`).

**Feedback**

- El formulario envía los datos a la API de Web3Forms. Su clave de acceso está en `Feedback.tsx`: es pública por diseño, porque solo permite enviar mensajes al mail de la cuenta. Incluye un campo oculto `botcheck` para filtrar bots.

**Build**

- Las páginas se cargan con `lazy`, así que Vite arma un archivo JS por página.
- `PokemonLink` está en su propio archivo porque trae `pokemon-data` (~138 kB): si estuviera en `RowParts`, Items también lo descargaría. Después de cambios, revisar en la salida del build que `SpriteImg-*.js` siga pesando unos 2 kB y que `pokemon-data-*.js` siga separado.
- **Tailwind también lee los comentarios:** una palabra de un comentario que coincide con una clase (por ejemplo "invisible") genera esa clase en el CSS. No rompe nada, pero suma unos bytes.
- Las imágenes de menos de 4 kB (como `pokeball1.webp`) se incluyen dentro del código en lugar de ir como archivos separados.
- `box-icons.ts` va en la carga inicial (unos 10 kB comprimidos) porque lo usa la tira de Home.

**Datos de la API que no sirven**

- `prices` de los objetos siempre viene vacío.
- El texto de los juegos se llama `text` en los objetos y `flavor_text` en las habilidades.

## Pendientes

- **Probar el rediseño de Moves en un celular real.**
- **Filtro por habilidad** en la caja del Team Planner: necesita un script nuevo que genere las habilidades de cada Pokémon. Postergado.
- **Sincronizar entre dispositivos** (favoritos, listas y equipos): las opciones son exportar e importar un JSON, un código de sincronización con una base de datos externa, o cuentas de usuario. Sin decidir.
- **Filtro por movimiento:** descartado; los datos serían enormes.
- El mensaje `Security Error: ... may not load or link to file:///` de la consola viene de una extensión del navegador, no del proyecto.
