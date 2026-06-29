import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchPokemonById } from '../lib/api'
import { getRandomPokemonId } from '../lib/regional'
import { POOL_SIZE } from '../lib/constants'
import { CarouselCard } from './CarouselCard'
import type { Pokemon } from '../types/pokemon'

const VISIBLE = 5
const CENTER = Math.floor(VISIBLE / 2) // 2

export function Carousel() {
  // Pool de Pokémon aleatorios (se pide una vez)
  const { data: pool } = useQuery({
    queryKey: ['carousel-pool'],
    queryFn: async () => {
      const ids = Array.from({ length: POOL_SIZE }, getRandomPokemonId)
      const results = await Promise.all(ids.map(fetchPokemonById))
      return results.filter((p): p is Pokemon => p !== null)
    },
    staleTime: Infinity, // no recargar el pool
  })

  const [index, setIndex] = useState(0)
  const timer = useRef<number | undefined>(undefined)

  // Auto-slide cada 6s
  useEffect(() => {
    if (!pool || pool.length === 0) return
    timer.current = window.setInterval(() => {
      setIndex((i) => i + 1)
    }, 6000)
    return () => clearInterval(timer.current) // limpia al desmontar
  }, [pool])

  if (!pool || pool.length === 0) return null

  // Reinicia el timer cuando el usuario usa una flecha
  function resetTimer() {
    clearInterval(timer.current)
    timer.current = window.setInterval(() => setIndex((i) => i + 1), 6000)
  }

  function next() { setIndex((i) => i + 1); resetTimer() }
  function prev() { setIndex((i) => i - 1); resetTimer() }

  // Calcula las 5 cartas visibles a partir del índice (con vuelta circular)
  const visible = Array.from({ length: VISIBLE }, (_, i) => {
    const poolIndex = ((index + i) % pool.length + pool.length) % pool.length
    return pool[poolIndex]
  })

  return (
    <section className="carousel-section w-full max-w-5xl px-4 mx-auto">
      <button className="carousel-arrow" onClick={prev}>‹</button>
      <div className="carousel-wrapper">
        <div className="carousel-track">
          {visible.map((p, i) => (
            <CarouselCard key={`${p.id}-${i}`} pokemon={p} isCenter={i === CENTER} />
          ))}
        </div>
      </div>
      <button className="carousel-arrow" onClick={next}>›</button>
    </section>
  )
}