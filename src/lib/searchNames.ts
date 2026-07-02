import { REGIONAL_SUFFIX_LIST, REGIONAL_PREFIX_MAP } from './constants'

export function matchNames(allNames: string[], query: string): string[] {
  const q = query.toLowerCase()
  return allNames.filter((name) => {
    if (name.includes(q)) return true
    const suffix = REGIONAL_SUFFIX_LIST.find((s) => name.endsWith(s))
    if (suffix) {
      const baseName = name.replace(suffix, '')
      const prefix = REGIONAL_PREFIX_MAP[suffix].toLowerCase()
      if (`${prefix} ${baseName}`.includes(q)) return true
    }
    return false
  })
}