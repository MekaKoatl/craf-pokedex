# CRAF Pokédex — Migración a React

Migración del proyecto Pokédex de Vanilla JS/HTML a React.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **React Router** — navegación entre páginas
- **TanStack Query (React Query)** — fetching y caché de la PokéAPI (Supongo)
- **Tailwind CSS v4** — estilos

## Progreso

- [x] **Setup del proyecto** — Vite + React + TypeScript
- [x] **Dependencias** — React Router, React Query y Tailwind CSS v4
- [x] **Providers** — QueryClient, Router y Favoritos conectados en `main.tsx`
- [x] **Tipos** — `PokemonEntry` (dataset local) y `Pokemon` (PokéAPI) en `types/pokemon.ts`
- [x] **Datos y utilidades** — `pokemon-data.ts`, `constants.ts` y `regional.ts` portados desde el proyecto original
- [x] **Capa de API** — `api.ts` con los fetchers de la PokéAPI
- [x] **Primer hook** — `usePokemon` con caché automática vía React Query
- [ ] **FavoritesContext** — estado global de favoritos (localStorage)
- [ ] **Componentes base** — FavButton, badges, DexCard
- [ ] **Sistema de filtros**
- [ ] **Páginas** — Favorites, Home, DXG, Details

## Estructura

\`\`\`
src/
  data/        · pokemon-data.ts (dataset local)
  types/       · pokemon.ts (tipos)
  lib/         · constants.ts, regional.ts, api.ts
  hooks/       · usePokemon.ts
  context/     · FavoritesContext.tsx
\`\`\`
