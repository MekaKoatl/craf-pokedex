import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { BackToTop } from "./components/BackToTop";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { Home } from "./pages/Home";

// Cada página se descarga recién la primera vez que la visitás.
// lazy() espera un "export default", pero nuestras páginas usan
// "export function Nombre"; el .then se la entrega en ese formato.
const DexGallery = lazy(() =>
  import("./pages/DexGallery").then((m) => ({ default: m.DexGallery })),
);
const DexStats = lazy(() =>
  import("./pages/DexStats").then((m) => ({ default: m.DexStats })),
);
const Details = lazy(() =>
  import("./pages/Details").then((m) => ({ default: m.Details })),
);
const Favorites = lazy(() =>
  import("./pages/Favorites").then((m) => ({ default: m.Favorites })),
);
const Abilities = lazy(() =>
  import("./pages/Abilities").then((m) => ({ default: m.Abilities })),
);
const Items = lazy(() =>
  import("./pages/Items").then((m) => ({ default: m.Items })),
);
const Moves = lazy(() =>
  import("./pages/Moves").then((m) => ({ default: m.Moves })),
);
const Lists = lazy(() =>
  import("./pages/Lists").then((m) => ({ default: m.Lists })),
);
const ListDetail = lazy(() =>
  import("./pages/ListDetail").then((m) => ({ default: m.ListDetail })),
);
const TeamPlanner = lazy(() =>
  import("./pages/TeamPlanner").then((m) => ({ default: m.TeamPlanner })),
);
const TeamEditor = lazy(() =>
  import("./pages/TeamEditor").then((m) => ({ default: m.TeamEditor })),
);

function App() {
  return (
    <>
      <Navbar />
      {/* Suspense muestra la pokébola mientras se descarga una página */}
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-8">
            <LoadingSpinner />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dxg" element={<DexGallery />} />
          <Route path="/dex-stats" element={<DexStats />} />
          <Route path="/details/:id" element={<Details />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/abilities" element={<Abilities />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/lists/:listId" element={<ListDetail />} />
          <Route path="/team-planner" element={<TeamPlanner />} />
          <Route path="/team-planner/:teamId" element={<TeamEditor />} />
          <Route path="/items" element={<Items />} />
          <Route path="/moves" element={<Moves />} />
        </Routes>
      </Suspense>
      <BackToTop />
    </>
  );
}

export default App;