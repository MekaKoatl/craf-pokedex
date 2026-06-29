import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Favorites } from "./pages/Favorites";
import { DexGallery } from './pages/DexGallery'
import { Home } from './pages/Home'

// TEMPO

function Details() {
  return <div className="p-8 text-gray-900">Details (????)</div>;
}

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
    </>
  );
}

export default App;
