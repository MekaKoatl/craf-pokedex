# MekaDragon's Pokédex (craf-pokedex)

[🇪🇸 Español](README.md) · 🇬🇧 English

A web Pokédex built with React on top of [PokéAPI](https://pokeapi.co): search and filters, a full page for every Pokémon, item, ability and move tables, favorites, custom lists and a per-game team planner. It deploys to Vercel from the `main` branch.

This README is for whoever is going to work on the code: how to run it, how it's organized, where the data comes from and what to keep in mind.

---

## Contents

1. [Running the project](#running-the-project)
2. [Stack](#stack)
3. [Pages and routes](#pages-and-routes)
4. [Folder structure](#folder-structure)
5. [Data: local and from the API](#data-local-and-from-the-api)
6. [Data scripts](#data-scripts)
7. [What is stored in the browser](#what-is-stored-in-the-browser)
8. [Conventions](#conventions)
9. [Technical notes](#technical-notes)
10. [To do](#to-do)

---

## Running the project

You need **Node 20.19 or newer** (Vite 8 doesn't run on older versions).

```bash
npm install       # once
npm run dev       # dev server (http://localhost:5173)
npm run build     # TypeScript check + production build into dist/
npm run preview   # serves the dist/ build to test it
npm run lint      # ESLint
```

`npm run build` fails on unused variables or imports (`noUnusedLocals` is on). Run it before every commit.

**Deploy:** Vercel builds automatically on every push to `main`. `vercel.json` rewrites every route to `index.html`, so direct links like `/details/25` work.

## Stack

| Tool                           | Used for                                            |
| ------------------------------ | --------------------------------------------------- |
| Vite 8 + React 19 + TypeScript | project base                                        |
| React Router 7                 | routes and navigation                               |
| TanStack Query 5               | PokéAPI requests with caching                       |
| Tailwind CSS 4                 | styles, together with custom CSS in `src/index.css` |
| PokéAPI + sprites on jsDelivr  | data and images                                     |
| pokesprite (jsDelivr)          | Pokémon box icons                                   |
| Web3Forms                      | sends the Feedback form by email                    |

## Pages and routes

| Route                                     | Page                         | What it does                                                                                                                                      |
| ----------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                       | `Home`                       | Pokémon of the day (guess or reveal), animated icon strip and quick search                                                                        |
| `/dxg`                                    | `DexGallery`                 | Full gallery with search, filters and "Load More"                                                                                                 |
| `/dex-stats`                              | `DexStats`                   | Base stats table, sortable by any column (local data only)                                                                                        |
| `/details/:id`                            | `Details`                    | Full page: sprites, types, matchups, evolutions, forms, learned moves and more. `?gender=female` shows the female form. An unknown id shows a 404 |
| `/items`                                  | `Items`                      | Item table with search, categories and A–Z letters                                                                                                |
| `/abilities`                              | `Abilities`                  | Ability table; `?open=<name>` opens one directly                                                                                                  |
| `/moves`                                  | `Moves`                      | Move table with type and category filters                                                                                                         |
| `/favorites`                              | `Favorites`                  | Favorites, with a search box to add more and filters                                                                                              |
| `/lists` · `/lists/:listId`               | `Lists` · `ListDetail`       | Custom lists (up to 20)                                                                                                                           |
| `/team-planner` · `/team-planner/:teamId` | `TeamPlanner` · `TeamEditor` | Per-game teams (up to 30): analysis, stats, Showdown export and import                                                                            |
| `/backup`                                 | `Backup`                     | Exports favorites, lists and teams to a `.json` file and imports them on another device                                                           |
| `/faq`                                    | `FAQ`                        | Frequently asked questions                                                                                                                        |
| `/disclaimer`                             | `Disclaimer`                 | Legal notice and thanks                                                                                                                           |
| `/feedback`                               | `Feedback`                   | Form to send feedback by email                                                                                                                    |
| `*`                                       | `NotFound`                   | 404 for any other route                                                                                                                           |

`Home` loads right away. Every other page is downloaded the first time you visit it (`lazy` in `src/App.tsx`). The footer links to FAQ, Disclaimer and Feedback.

## Folder structure

```
scripts/                  Node scripts that generate the files in src/data
src/
  App.tsx                 Layout (Navbar, routes, Footer) and lazy-loaded pages
  main.tsx                Providers: Query > Favorites > Lists > Teams > Router
  index.css               Tailwind + custom CSS (buttons, cards, tables, filters, mobile)
  assets/                 Own images (fondo1.webp, pokeball1.webp, move category icons)
  data/                   Generated by the scripts. Don't edit by hand.
  types/                  TypeScript types for the API (pokemon, move, item, ability)
  lib/                    Plain functions, no React: API, rules, math, text
  hooks/                  Custom hooks (data, filters, list state, screen)
  context/                Global state saved to localStorage
  components/
    badges/               TypeBadge, FormBadge, CategoryBadge
    filters/              FilterBar, FilterPanel, FilterPill
    details/              The sections of the Details page
    items/ abilities/ moves/   Each table row (closed and open)
    lists/                Pieces shared by the three tables: LetterStrip, RowParts, PokemonLink
    collection/           Pieces shared by Lists and Team Planner: toolbar, selectable card, rename form
    team/                 Everything in the Team Planner
    (loose)               DexCard, Navbar, Footer, SearchBar, SpriteImg, PokemonIcon,
                          AddToListButton, LoadMoreButton, NotFoundMessage...
  pages/                  One per route
```

The most important files in `src/lib`:

| File              | What's in it                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| `api.ts`          | Every PokéAPI request. `getPokemonFull` throws `NotFoundError` on a 404                                            |
| `sprites.ts`      | Image URLs: `cdnSprite`, pokesprite icons and their measurements, sprites, official artwork, Dream World, item art |
| `regional.ts`     | Display names ("Alolan Raichu") and regional forms                                                                 |
| `evolution.ts`    | Walking the evolution chain and building the requirements                                                          |
| `dexOrder.ts`     | Pokédex number (regional forms use their species') and ordering                                                    |
| `games.ts`        | Game list, what each game has, tag colors and which image to use                                                   |
| `teamRules.ts`    | Per-game rules: abilities, moves, items, Megas, natures and stat formulas                                          |
| `typeChart.ts`    | Type chart by generation and abilities that change damage                                                          |
| `teamTransfer.ts` | Moving members to another game, dropping what isn't valid there (Duplicate and Import)                             |
| `showdown.ts`     | Export and import of the Pokémon Showdown text format                                                              |
| `backup.ts`       | Export and import favorites, lists and teams (Backup page)                                                         |
| `collections.ts`  | Sort options shared by lists and teams                                                                             |
| `daily.ts`        | Pokémon of the day                                                                                                 |

Shared hooks worth knowing:

| Hook                              | What it does                                                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `useListControls`                 | State of the Items / Abilities / Moves tables: search, letter, column sort, open row. Comes with `filterAndSort`, `byName` and `byMap` |
| `usePagedList`                    | Paginates an already filtered and sorted list of names, fetching 30 at a time                                                          |
| `useSelection`                    | Selection mode (select, select all, bulk delete) for lists and teams                                                                   |
| `useTeamDefense` / `useTeamForms` | Team defense by type and each member's data (including its Mega)                                                                       |
| `useIsMobile` / `useMediaQuery`   | Screen conditions that update on resize                                                                                                |

## Data: local and from the API

There are two sources:

- **Local data (`src/data/`).** Generated by the scripts and shipped inside the build. Used for anything that has to be instant or is read in bulk: filters, search, the Team Planner box and the stats table.
- **PokéAPI.** Everything else is fetched when needed and kept in TanStack Query's cache: full Pokémon data, moves, items, abilities, species and evolution chains.

| File               | What it holds                                                                                                  | Script                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `pokemon-data.ts`  | 1082 entries (1025 species + regional forms): name, types, region, form badges, whether it's a final evolution | `fetch-pokemon-data.mjs` |
| `pokemon-stats.ts` | The 6 base stats of each entry                                                                                 | `fetch-stats.mjs`        |
| `pokemon-games.ts` | Which Pokémon are in each game group                                                                           | `fetch-games.mjs`        |
| `regional-dex.ts`  | Each game's regional Pokédex, in order                                                                         | `fetch-regional-dex.mjs` |
| `held-items.ts`    | Holdable items, their category and the generation they appeared in                                             | `fetch-items.mjs`        |
| `box-icons.ts`     | Each Pokémon's pokesprite icon and where it's drawn; measurements of the Gen IX sprites                        | `fetch-box-icons.mjs`    |

## Data scripts

Run them from the project root, e.g. `node scripts/fetch-stats.mjs`. Each one fetches from PokéAPI and rewrites its file in `src/data/`. They can take several minutes. Each script's header says what it generates and what it depends on.

**Order:** `fetch-stats`, `fetch-games` and `fetch-box-icons` read `pokemon-data.ts`, so whenever that file changes, run them in this order:

1. `fetch-pokemon-data.mjs`. When it finishes it prints what was added, removed or changed compared to the previous file.
2. `fetch-stats.mjs`
3. `fetch-games.mjs`
4. `fetch-box-icons.mjs`

`fetch-regional-dex.mjs` and `fetch-items.mjs` don't depend on anything; run them when needed (for example, when a new game comes out).

## What is stored in the browser

Everything lives in `localStorage`; there is no server and no accounts. Data doesn't sync between devices on its own: the Backup page (`/backup`, logic in `lib/backup.ts`) exports favorites, lists and teams to a `.json` file and imports it on another device, merging with or replacing what's there.

| Key               | What it stores                        | Handled in                       |
| ----------------- | ------------------------------------- | -------------------------------- |
| `craf-favorites`  | favorite ids                          | `context/FavoritesContext.tsx`   |
| `craf-lists`      | lists `{ id, name, pokemon[] }`       | `context/ListsContext.tsx`       |
| `craf-teams`      | teams `{ id, name, game, members[] }` | `context/TeamsContext.tsx`       |
| `craf-wtp-<date>` | result of the Pokémon of the day      | `components/WhosThatPokemon.tsx` |

If the shape of stored data changes, old data must keep working. For example, `level`, `evs` and `ivs` in `TeamMember` are optional because teams saved earlier don't have them.

## Conventions

**Code**

- The UI is in English; code comments are in Spanish.
- **Comments document how the code works**, not how React works or what changed. Every exported function, hook, component, type and constant has a JSDoc block (`/** ... */`) that VS Code shows on hover; `//` comments inside the code are only for decisions that aren't obvious.
- Formatting: Prettier with its default settings.
- Named exports (`export function Details`), not `export default`. That's why `App.tsx` uses `lazy(() => import(...).then((m) => ({ default: m.Details })))`.
- Hooks go **before** any early `return`.
- To reset state when a value changes (for example, closing a menu when the route changes), compare against the previous value during render instead of calling `setState` inside a `useEffect`. See `Navbar.tsx`.
- Every PokéAPI sprite goes through `cdnSprite()` or is built with the helpers in `sprites.ts` (see technical notes).
- To show sprites, use `SpriteImg`: it shows the loading Unown, retries on GitHub if jsDelivr fails, and only downloads near the screen (`loading="lazy"`).
- For Pokémon icons in cards, grids and search results, use `PokemonIcon` (see technical notes).
- Buttons: `btn-primary` (red) and `btn-ghost` (white pill) in `index.css` hold colors and states; size, padding and radius go in each use with Tailwind classes.
- A new page is added to `App.tsx` with `lazy`, and to `Navbar.tsx` or `Footer.tsx`.

**Mobile** (the breakpoint is `sm:`, 640px)

- Anything tappable is at least **45px**: `min-h-[45px] sm:min-h-0`. When that doesn't fit, the touch area grows without changing the look, using `after:absolute after:-inset-[...]`.
- Inputs and selects use a **16px** font on mobile (`text-base sm:text-sm`). Anything smaller makes iOS zoom in when you tap them.
- Hover effects go inside `@media (hover: hover)`, because on phones hover sticks after a tap. Tailwind 4's `hover:` already does this.
- To know whether it's a phone from React: `useIsMobile()`; for any other condition, `useMediaQuery()`. Don't call `window.matchMedia` directly during render: it won't notice changes.

## Technical notes

**Images**

- **jsDelivr, not GitHub.** Sprites from `raw.githubusercontent.com` returned 429 (too many requests). `cdnSprite()` rewrites those URLs to jsDelivr. If a jsDelivr image fails, `SpriteImg` retries it once from GitHub before calling its `onError`.
- **Pokémon icons (`PokemonIcon`):** they use the box icons from [pokesprite](https://github.com/msikma/pokesprite) (Gen VIII style, from a pinned version on jsDelivr), which cover up to #905 plus the Alolan, Galarian and Hisuian forms. Gen IX and the Paldean forms use the PokeAPI sprite (community-made pixel art). `fetch-box-icons` measures where each Pokémon is drawn, and `PokemonIcon` centers it and scales it along a gentle curve: big ones look bigger, without sharp jumps (`CURVE` in `PokemonIcon.tsx`).
- **Switch games** (`ARTWORK_GROUPS` in `games.ts`): the team editor slots and the member panel use official artwork instead of pixel sprites. Cards and the box use `PokemonIcon` in every game.
- **Cards on mobile** use the Dream World drawing (SVG). If it doesn't exist for that Pokémon, `onError` switches to the official artwork. The Regional Forms cards inside Details stay pixel (`<DexCard pixel />`).
- **No female official artwork.** `official-artwork` has no female version; the gallery fills the ♀ slots from the `_female` field or from the female variety.
- **Item art:** the open item row tries `itemArtUrls()` in order (gen9 → gen8 → Dream World) and falls back to the pixel sprite.

**Pokémon and forms**

- **Regional forms** live in `pokemon-data.ts` with `isRegional: true` and names like `raichu-alola` or `tauros-paldea-combat-breed`. They're detected by the suffix at the end **or in the middle** of the name.
- **Default names.** Some Pokémon carry the form in their API name (`mimikyu-disguised`). `DEFAULT_FORMS` in `regional.ts` shows them clean.
- **Evolution chain and regional forms.** It uses `required_pokemon_form` and `evolved_pokemon_form` from each `evolution_detail`. A path with no required form only applies to the normal form.
- **Gender varieties.** Details shows one page per species: the female id redirects to the species with `?gender=female`, and `shown` decides where stats, abilities and measurements come from.
- **Pokémon that doesn't exist.** `getPokemonFull` throws `NotFoundError` on a 404 and `usePokemonDetails` doesn't retry it, so Details shows the 404 right away. Other errors (network) are retried up to 3 times.
- **Pokémon of the day.** `daily.ts` shuffles the 1025 ids with a per-year seed and spreads out close numbers: no repeats within the year and no similar numbers in the same week.

**Tables and lists**

- **Items, Abilities and Moves share their pieces:** `useListControls` (state), `usePagedList` (pagination), `LetterStrip`, `LoadMoreButton` and `RowParts` (close button, flavor/effect, info grid). Their CSS is also shared: `.item-table`, `.ability-table` and `.move-table` have the same rules and only differ in their columns.
- **Cache key for paginated lists.** `usePagedList` takes the names plus a short key. Everything that changes the list (search, filter, letter, order) must be in that key, or the old cache is shown.
- **Sorting covers the whole list,** not just what's loaded: it sorts before paginating.
- **Lazy maps** (`useItemCategoryMap`, `useAbilityGenMap`, `useMoveTypeMap`, `useMoveCategoryMap`) are fetched only when sorting by that column.
- **The Pokémon column in Abilities doesn't sort,** because that count only comes in each ability's detail.
- **Lists and Team Planner share** `useSelection`, `CollectionToolbar`, `SelectableCard`, `RenameForm` and `sortCollection`.

**Team Planner**

- **Per game, not per generation:** Ruby and Omega Ruby are different games. `gameFeatures()` says what exists in each one (abilities, items, natures, Fairy type); whatever doesn't exist isn't shown.
- **Game-accurate:** abilities use `past_abilities` and moves use `past_values` (what changed after that game). Up to Gen III, physical or special depends on the type. The type chart changes by generation (Gen I quirks; Steel resisted Ghost and Dark before Gen VI).
- **Megas:** the Mega Stone is matched by the first 5 letters of the species, and only for species with the `M` badge (otherwise Pidgey would "get" Pidgeotite).
- **Stats:** Gen III+ formulas; default level 50. Before Gen III only base stats are shown.
- **Defense analysis:** ×2 subtracts 1, ×4 subtracts 2, ×½ adds 1, ×¼ or immune adds 2. It's computed by `useTeamDefense`, shared by Team Analysis and the "Covers weaknesses" filter.
- **Duplicate and Import** go through `transferMembers()`, which drops what isn't valid in the chosen game and returns notes to show.
- **Showdown:** without `Level:`, Showdown uses level 100. Megas are imported as the normal species holding its Mega Stone.
- **Reordering:** drag with a mouse; arrows with a finger (`useMediaQuery("(pointer: fine)")`).

**Feedback**

- The form posts to the Web3Forms API. Its access key is in `Feedback.tsx`: it's public by design, since it can only send messages to the account's email. It includes a hidden `botcheck` field to filter bots.

**Build**

- Pages are loaded with `lazy`, so Vite builds one JS file per page.
- `PokemonLink` lives in its own file because it pulls in `pokemon-data` (~138 kB): if it were in `RowParts`, Items would download it too. After changes, check that `SpriteImg-*.js` stays around 2 kB and `pokemon-data-*.js` stays separate in the build output.
- **Tailwind also reads comments:** a word in a comment that matches a class name (for example "invisible") generates that class in the CSS. It's harmless but adds a few bytes.
- Images under 4 kB (like `pokeball1.webp`) are inlined into the code instead of being separate files.
- `box-icons.ts` is part of the initial load (about 10 kB gzipped) because the Home strip uses it.

**API data that doesn't help**

- Item `prices` is always empty.
- Flavor text is called `text` for items and `flavor_text` for abilities.

## To do

- **Test the Moves redesign on a real phone.**
- **Ability filter** in the Team Planner box: needs a new script that generates each Pokémon's abilities. Postponed.
- **Sync between devices:** for now, through the Backup page (a `.json` file). A sync code with an external database or user accounts are still undecided.
- **Move filter:** dropped; the data would be huge.
- The `Security Error: ... may not load or link to file:///` console message comes from a browser extension, not from the project.
