import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { BackToTop } from "./components/BackToTop";
import { Favorites } from "./pages/Favorites";
import { DexGallery } from "./pages/DexGallery";
import { Home } from "./pages/Home";
import { Details } from "./pages/Details";
import { Items } from "./pages/Items";
import { Abilities } from "./pages/Abilities";
import { Moves } from "./pages/Moves";
import { DexStats } from "./pages/DexStats";
import { TeamEditor } from "./pages/TeamEditor";
import { Lists } from "./pages/Lists";
import { ListDetail } from "./pages/ListDetail";
import { TeamPlanner } from "./pages/TeamPlanner";

function App() {
  return (
    <>
      <Navbar />
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
      <BackToTop />
    </>
  );
}

export default App;
