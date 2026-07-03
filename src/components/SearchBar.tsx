import { useState, useEffect } from 'react'

export function SearchBar({
  onSearch,
  placeholder = 'Search Pokémon by name...',
}: {
  onSearch: (query: string) => void
  placeholder?: string
}) {
  const [value, setValue] = useState('')

  // Debounce: espera 400ms tras dejar de teclear
  useEffect(() => {
    const t = setTimeout(() => onSearch(value.trim()), 400)
    return () => clearTimeout(t)
  }, [value, onSearch])

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-full text-gray-700 text-sm focus:outline-none focus:border-red-400 mb-4"
    />
  )
}