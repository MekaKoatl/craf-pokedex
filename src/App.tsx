import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { BackToTop } from "./components/BackToTop";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { Home } from "./pages/Home";

// Las páginas se cargan bajo demanda (code splitting): cada una se descarga
// la primera vez que se visita. Como usan exports con nombre, el `.then`
// las adapta al `default` que espera `lazy()`. Home se importa directo.
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
const NotFound = lazy(() =>
  import("./pages/NotFound").then((m) => ({ default: m.NotFound })),
);
const Disclaimer = lazy(() =>
  import("./pages/Disclaimer").then((m) => ({ default: m.Disclaimer })),
);
const FAQ = lazy(() => import("./pages/FAQ").then((m) => ({ default: m.FAQ })));
const Feedback = lazy(() =>
  import("./pages/Feedback").then((m) => ({ default: m.Feedback })),
);

/** Estructura de la app: barra de navegación, rutas, pie de página y botón de volver arriba. */
function App() {
  return (
    // min-h-screen + flex-1 en main: el footer queda al fondo en páginas cortas
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Indicador de carga mientras se descarga una página */}
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
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

export default App;
