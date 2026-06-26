import { usePokemon } from './hooks/usePokemon'
import { DexCard } from './components/DexCard'

function App() {
  const { data, isLoading } = usePokemon(25)
  if (isLoading || !data) return <p className="p-8">Cargando...</p>

  return (
    <div className="p-8" style={{ maxWidth: 250 }}>
      <DexCard pokemon={data} />
    </div>
  )
}

export default App