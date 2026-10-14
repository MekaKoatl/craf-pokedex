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
- Galería de sprites con lupa y descarga (incluye los iconos de PC de gen VII y VIII).
- Cadena evolutiva con ramas y soporte de formas regionales.
- Tipos, generación, habitat, flavor text, altura, peso, habilidades y stats base.
- More Info: acordeón lazy con egg groups, ratio de género, captura, color, locations expandibles y más.
- Regional Forms y Alt Forms (Mega/Gmax con diff de stats contra la forma base).

## Estructura

    src/
      data/
        pokemon-data.ts          · dataset local (1042 Pokémon)
      types/
        pokemon.ts               · todos los tipos
      lib/
        constants.ts             · BASE_URL, totales, sufijos regionales
        api.ts                   · fetchers de la PokéAPI
        regional.ts              · nombres regionales, id aleatorio, formas regionales
        sprites.ts               · cdnSprite(): reescribe GitHub → jsDelivr
        filterPokemon.ts         · filtrado del dataset local
        searchNames.ts           · match de nombres (incluye regionales)
        evolution.ts             · recorrido de la cadena evolutiva
        daily.ts                 · Pokémon del día y countdown
      hooks/
        usePokemon · usePokemonDetails · usePokemonNames
        useDexGallery · useFilters · useFilteredPokemon · useSearchPokemon
        useFavorites · useDailyPokemon · useTickerPokemon
      context/
        FavoritesContext.tsx     · favoritos (key "craf-favorites")
      components/
        DexCard · Navbar · FavButton · LoadingSpinner · EmptyState
        SearchBar · BackToTop · WhosThatPokemon · SpriteTicker
        badges/   · TypeBadge, FormBadge
        filters/  · FilterBar, FilterPanel, FilterPill
        details/  · SpriteGallery, ImageModal, EvoChain, RegionalForms,
                    MorInfoPanel, AltFormsAccordion, StatBar
      pages/
        Home · DexGallery · Favorites · Details

## Notas técnicas

- **Sprites y rate limit.** Los sprites de GitHub devolvían 429. `cdnSprite()` reescribe las URLs a jsDelivr y resuelve el problema. Todo sprite nuevo debe pasar por esa función.
- **Dataset local vs. API.** `pokemon-data.ts` se sincronizó con las Mega Evoluciones de Pokémon Legends Z-A mediante un script que detectó 115 Pokémon con mega/gmax vía la API y actualizó 36 entradas.
- **Formas regionales.** Viven en el dataset local con `isRegional: true` y nombres tipo `raichu-alola`. `getRegionalFormsOf()` consulta el dataset antes de pedir nada a la API, para no generar 404s.
- **Cadena evolutiva regional.** Cuando el Pokémon es regional, `EvoChain` intenta `${nombre}${sufijo}` y cae al normal si esa forma no existe.
- **Iconos de PC.** Vienen en `sprites.versions["generation-viii"].icons` (o gen VII). Gen 9 no los tiene, así que siempre conviene un fallback al sprite normal.
- **Loop de la cinta.** La lista se renderiza duplicada y la animación mueve el track un -50%; al reiniciarse el salto es invisible.

## Pendientes

- Un `Security Error: ... may not load or link to file:///` aparece en consola. No rompe nada; falta ubicar el origen.
- `MorInfoPanel.tsx` tiene un typo en el nombre del archivo (debería ser `MoreInfoPanel.tsx`).
- Los estilos `.carousel-*` en `index.css` quedaron sin uso tras eliminar el carrusel viejo.

## Scripts

    npm run dev       # servidor de desarrollo
    npm run build     # type-check + build de producción
    npm run preview   # preview del build
    npm run lint      # ESLint
