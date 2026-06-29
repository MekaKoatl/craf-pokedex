import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'

// TEMPO
function Home() { return <div className="p-8 text-gray-900">Home (????)</div> }
function DexGallery() { return <div className="p-8 text-gray-900">DXG (?????)</div> }
function Details() { return <div className="p-8 text-gray-900">Details (????)</div> }
function Favorites() { return <div className="p-8 text-gray-900">Favorites (????)</div> }

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
  )
}

export default App