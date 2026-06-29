import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Favorites } from "./pages/Favorites";
import { DexGallery } from './pages/DexGallery'

// TEMPO
function Home() {
  return <div className="p-8 text-gray-900">Home (????)</div>;
}

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
