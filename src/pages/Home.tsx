import { Carousel } from '../components/Carousel'

export function Home() {
  return (
    <div>
      <Carousel />
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Pokedex Search</h2>
        <p className="text-gray-400">Quickly search for a Pokemon (there are more search options in the Dex Search tab)</p>
      </section>
    </div>
  )
}