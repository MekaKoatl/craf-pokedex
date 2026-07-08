# CRAF Pokédex — Migración a React

Migración del proyecto Pokédex de Vanilla JS/HTML a React. Aplicación desplegada en Vercel.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **React Router** — navegación entre páginas (SPA)
- **TanStack Query (React Query)** — fetching y caché de la PokéAPI
- **Tailwind CSS v4** — estilos

## Características

- **Home** — carousel de Pokémon aleatorios, buscador y filtros
- **Dex Gallery (DXG)** — galería completa con "Load More", filtros y búsqueda
- **Favorites** — favoritos persistentes (localStorage), con búsqueda y filtros
- **Details** — sprites (con lupa y descarga), cadena evolutiva (incluye ramas y formas regionales), stats, more info, formas regionales y alternativas (Mega/Gmax)
- Búsqueda por nombre y por número de Pokédex
- Filtros por tipo, región, generación, evoluciones y formas
- Sprites servidos vía jsDelivr para evitar rate limits

## Progreso

- [x] **Setup** — Vite + React + TypeScript
- [x] **Dependencias** — React Router, React Query, Tailwind CSS v4
- [x] **Providers** — QueryClient, Router y Favoritos en `main.tsx`
- [x] **Tipos** — `types/pokemon.ts`
- [x] **Datos y utilidades** — `pokemon-data.ts`, `constants.ts`, `regional.ts`
- [x] **Capa de API** — `api.ts` con fetchers y `fetchInBatches`
- [x] **Hooks** — `usePokemon`, `useDexGallery`, `useFilteredPokemon`, `useSearchPokemon`, etc.
- [x] **FavoritesContext** — estado global de favoritos (localStorage)
- [x] **Componentes base** — FavButton, badges, DexCard, Navbar
- [x] **Sistema de filtros** — compartido entre Home, DXG y Favorites
- [x] **Buscadores** — Home y DXG (nombre + número de dex)
- [x] **Páginas** — Home, DXG, Favorites, Details
- [x] **Deploy** — Vercel
- [ ] **Pulidos** — back-to-top, revisión nav móvil

## Estructura

\`\`\`
src/
  data/        · pokemon-data.ts (dataset local)
  types/       · pokemon.ts
  lib/         · constants.ts, regional.ts, api.ts, sprites.ts,
                 filterPokemon.ts, searchNames.ts, evolution.ts
  hooks/       · usePokemon, useDexGallery, useFilters,
                 useFilteredPokemon, useSearchPokemon, usePokemonNames,
                 usePokemonDetails, useFavorites
  context/     · FavoritesContext.tsx
  components/  · DexCard, Navbar, FavButton, LoadingSpinner, EmptyState,
                 SearchBar, badges/, filters/, carousel/, details/
  pages/       · Home, DexGallery, Favorites, Details
\`\`\`
