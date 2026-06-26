import { REGIONAL_SUFFIX_LIST, REGIONAL_PREFIX_MAP, TOTAL_POKEMON } from './constants'

// "raichu-alola" → "Alolan Raichu"
export function getRegionalDisplayName(name: string): string {
  const suffix = REGIONAL_SUFFIX_LIST.find((s) => name.endsWith(s))
  if (!suffix) return name.charAt(0).toUpperCase() + name.slice(1)
  const baseName = name.replace(suffix, '')
  return `${REGIONAL_PREFIX_MAP[suffix]} ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`
}

export function getRandomPokemonId(): number {
  return Math.floor(Math.random() * TOTAL_POKEMON) + 1
}