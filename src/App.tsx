import { usePokemon } from './hooks/usePokemon'

function App() {
  const { data, isLoading, isError } = usePokemon(25)

  if (isLoading) return <p className="p-8">Cargando...</p>
  if (isError) return <p className="p-8">Error al cargar</p>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-600 capitalize">{data?.name}</h1>
      <img src={data?.sprites.front_default ?? ''} alt={data?.name} />
    </div>
  )
}

export default App