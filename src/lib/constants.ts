export const BASE_URL = 'https://pokeapi.co/api/v2'

export const TOTAL_POKEMON = 1025
export const POOL_SIZE = 15

// Los iconos de PC existen para los ids 1-809 (hasta gen VII)
export const MAX_ICON_ID = 809

// Sufijos y prefijos para formas regionales
export const REGIONAL_SUFFIX_LIST = ['-alola', '-galar', '-hisui', '-paldea']

export const REGIONAL_PREFIX_MAP: Record<string, string> = {
  '-alola': 'Alolan',
  '-galar': 'Galarian',
  '-hisui': 'Hisuian',
  '-paldea': 'Paldean',
}