# CRAF Pokédex — Migración a React

Migración del proyecto Pokédex de Vanilla JS/HTML a React. La migración está completa y desplegada en Vercel.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **React Router** — navegación entre páginas
- **TanStack Query (React Query)** — fetching y caché de la PokéAPI
- **Tailwind CSS v4** — estilos (combinado con CSS propio en `index.css`)
- **PokéAPI** (pokeapi.co) — datos
- **Vercel** — deploy, con `vercel.json` (rewrites para SPA)

## Estado

Migración terminada y funcional.

- [x] Setup del proyecto — Vite + React + TypeScript
- [x] Dependencias — React Router, React Query y Tailwind CSS v4
- [x] Providers — QueryClient, Router y Favoritos conectados en `main.tsx`
- [x] Tipos — `PokemonEntry`, `Pokemon`, `PokemonFull`, `Species`, `EvoNode`, `EvolutionChain`, `FormBadge`
- [x] Datos y utilidades — dataset local y helpers portados del proyecto original
- [x] Capa de API — fetchers de la PokéAPI
- [x] FavoritesContext — estado global de favoritos (localStorage)
- [x] Componentes base — FavButton, badges, DexCard
- [x] Sistema de filtros — Type, Region, Generation, Evolutions, Forms
- [x] Páginas — Home, DXG, Favorites, Details
- [x] Home rediseñado — "Who's that Pokémon?" diario + cinta de iconos
- [x] Feedback de carga — gif de Unown mientras resuelve cada sprite
- [x] Navbar con dropdown "More data", que toma el nombre de la página activa
- [x] Páginas Items y Abilities — listado, buscador, filtros y expansión en línea
- [x] Details unificado por género — una sola página por especie
- [x] Cadena evolutiva completa, con panel de requisitos

## Páginas

**Home**
- Sección "Pokémon of the day": silueta del Pokémon del día (determinista por fecha), con botones Reveal y Guess. El resultado se guarda en localStorage por día y hay un contador hasta la medianoche local.
- Cinta de iconos de PC: 50 Pokémon aleatorios en loop infinito. Se frena al hacer hover y muestra una tarjeta flotante con número, sprite animado, nombre y tipos. Click → Details.
- Búsqueda rápida: buscador (nombre o número), filtros de Type/Region/Generation y un grid inicial de 15.

**DXG (Dex Gallery)**
- Galería con Load More vía infinite query (lotes de 150, con las formas regionales intercaladas).
- Buscador y filtros completos, incluidos Evolutions y Forms.

**Favorites**
- Favoritos guardados en localStorage, con búsqueda y filtros aplicados en memoria.

**Details**
- Galería de sprites: imagen principal arriba y tira horizontal de selección abajo (incluye los iconos de PC).
- Cadena evolutiva completa con ramas, formas regionales y panel colapsable de requisitos.
- Conmutador de género cuando la especie tiene variedades separadas.
- Tipos, generación, habitat, flavor text, altura, peso, habilidades y stats base.
- More Info: acordeón lazy con egg groups, ratio de género, captura, color, locations expandibles y más.
- Regional Forms y Alt Forms (Mega/Gmax con diff de stats contra la forma base).

**Items**
- Listado con buscador y filtro por categoría (8 grupos propios sobre las 54 categorías de la API).
- Al hacer click, la fila se expande en línea con el detalle del objeto y se marca con separadores arriba y abajo.

**Abilities**
- Listado con buscador, el efecto resumido y la cantidad de Pokémon que la tienen.
- Misma expansión en línea que Items.

## Estructura

    src/
      data/
        pokemon-data.ts          · dataset local (1042 Pokémon)
      types/
        pokemon.ts               · todos los tipos
      lib/
        constants.ts             · BASE_URL, totales, sufijos regionales
        api.ts                   · fetchers de la PokéAPI
        regional.ts              · nombres regionales y formas regionales
        sprites.ts               · cdnSprite(), iconos de PC, sprite de carga
        filterPokemon.ts         · filtrado del dataset local
        searchNames.ts           · match de nombres (incluye regionales)
        evolution.ts             · recorrido de la cadena y requisitos
        itemGroups.ts            · las 54 categorías de la API en 8 grupos
        daily.ts                 · Pokémon del día y countdown
        text.ts                  · helpers de texto e idFromUrl()
      hooks/
        usePokemon · usePokemonDetails · usePokemonNames
        useDexGallery · useFilters · useFilteredPokemon · useSearchPokemon
        useFavorites · useDailyPokemon · useTickerPokemon
        useItems · useAbilities
      context/
        FavoritesContext.tsx     · favoritos (key "craf-favorites")
      components/
        DexCard · Navbar · FavButton · LoadingSpinner · EmptyState
        SearchBar · BackToTop · WhosThatPokemon · SpriteTicker · SpriteImg
        badges/     · TypeBadge, FormBadge
        filters/    · FilterBar, FilterPanel, FilterPill
        details/    · SpriteGallery, ImageModal, EvoChain, RegionalForms,
                      MorInfoPanel, AltFormsAccordion, StatBar
        items/      · ItemRow
        abilities/  · AbilityRow
      pages/
        Home · DexGallery · Favorites · Details · Items · Abilities

## Notas técnicas

- **Sprites y rate limit.** Los sprites de GitHub devolvían 429. `cdnSprite()` reescribe las URLs a jsDelivr y resuelve el problema. Todo sprite nuevo debe pasar por esa función.
- **Dataset local vs. API.** `pokemon-data.ts` se sincronizó con las Mega Evoluciones de Pokémon Legends Z-A mediante un script que detectó 115 Pokémon con mega/gmax vía la API y actualizó 36 entradas.
- **Formas regionales.** Viven en el dataset local con `isRegional: true` y nombres tipo `raichu-alola`. `getRegionalFormsOf()` consulta el dataset antes de pedir nada a la API, para no generar 404s.
- **Cadena evolutiva regional.** Cuando el Pokémon es regional, `EvoChain` intenta `${nombre}${sufijo}` y cae al normal si esa forma no existe.
- **Iconos de PC.** Están en `generation-vii/icons` y van del 1 al 809; **no existe** `generation-viii/icons` pese a que la API declara el campo. De 810 en adelante hay que caer al sprite normal, que es lo que hace `iconOrSprite()`.
- **Loop de la cinta.** La lista se renderiza duplicada y la animación mueve el track un -50%; al reiniciarse el salto es invisible.
- **Pokémon del día.** `daily.ts` baraja los 1025 ids con Fisher-Yates sobre un mulberry32 sembrado con el año, y después hace una pasada de reparación que garantiza al menos 25 de distancia entre Pokémon dentro de una ventana de 7 días. Resultado: ningún repetido en el año y nunca dos números cercanos en la misma semana.
- **Variedades por género.** Algunas especies tienen variedades aparte (`meowstic-male` / `meowstic-female`) y otras solo campos `_female` en los sprites (Pyroar, Unfezant). Details unifica ambos casos en una sola página: el id de la hembra redirige al de la especie con `?gender=female`, el género vive en la URL y la variable `shown` alimenta stats, habilidades y medidas mientras el título, la galería y el favorito siguen el id de la especie.
- **Arte oficial sin versión hembra.** `official-artwork` no tiene carpeta `female`: es un PNG por id de Pokémon. Las hembras sí existen en los sprites de juego, en `home` y en los animados de gen V. La galería resuelve cada hueco ♀ con `??`, tomando el campo `_female` del propio Pokémon o, si no hay, el sprite de la variedad hembra.
- **Cadena evolutiva por niveles.** `getDescendantLevels()` recorre los descendientes nivel por nivel, así una rama a cualquier profundidad se muestra completa (Ralts ve a Gardevoir y Gallade, Wurmple ve a Beautifly y Dustox). `.evo-branch-grid` es flex y no grid: con `repeat(3, 1fr)` quedaba una columna vacía que corría todo hacia la izquierda.
- **Requisitos de evolución.** `describeEvolution()` arma la lista completa de condiciones de cada vía, en vez de devolver solo la primera como `getEvoCondition()`. `evolution_details` puede traer varias vías alternativas (Milotic tiene dos).
- **Precio de los objetos.** El campo `prices` de la API viene siempre vacío, así que no hay forma de mostrar el costo de un objeto.
- **Flavor text.** Los objetos lo exponen como `flavor_text_entries[].text` y las habilidades como `flavor_text_entries[].flavor_text`. No son el mismo campo.

## Pendientes

- Un `Security Error: ... may not load or link to file:///` aparece en consola. No rompe nada; falta ubicar el origen.
- `MorInfoPanel.tsx` tiene un typo en el nombre del archivo (debería ser `MoreInfoPanel.tsx`).
- Los estilos `.carousel-*` en `index.css` quedaron sin uso tras eliminar el carrusel viejo.
- Código muerto: `getItemCategories()` en `lib/api.ts`, el archivo `hooks/useItemCategories.ts` y el `getRandomPokemonId` comentado en `lib/regional.ts`.
- Sin usar: los sprites de `showdown` (gifs animados) y `dream-world` (SVG), que incluyen versiones hembra.

## Scripts

    npm run dev       # servidor de desarrollo
    npm run build     # type-check + build de producción
    npm run preview   # preview del build
    npm run lint      # ESLint