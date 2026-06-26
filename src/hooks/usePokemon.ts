import { useQuery } from '@tanstack/react-query'
import { getPokemon } from '../lib/api'

export function usePokemon(nameOrId: string | number) {
  return useQuery({
    queryKey: ['pokemon', nameOrId],
    queryFn: () => getPokemon(nameOrId),
  })
}