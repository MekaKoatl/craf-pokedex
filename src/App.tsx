import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { BackToTop } from "./components/BackToTop";
import { Favorites } from "./pages/Favorites";
import { DexGallery } from './pages/DexGallery'
import { Home } from './pages/Home'
import { Details } from './pages/Details'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dxg" element={<DexGallery />} />
        <Route path="/details/:id" element={<Details />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
      <BackToTop />
    </>
  );
}

export default App;