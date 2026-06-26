export const BASE_URL = 'https://pokeapi.co/api/v2'

export const TOTAL_POKEMON = 1025
export const POOL_SIZE = 15

// Sufijos y prefijos para formas regionales
export const REGIONAL_SUFFIX_LIST = ['-alola', '-galar', '-hisui', '-paldea']

export const REGIONAL_PREFIX_MAP: Record<string, string> = {
  '-alola': 'Alolan',
  '-galar': 'Galarian',
  '-hisui': 'Hisuian',
  '-paldea': 'Paldean',
}