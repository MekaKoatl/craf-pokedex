import { useContext } from 'react'
import { ListsContext } from '../context/ListsContext'

export function useLists() {
  const ctx = useContext(ListsContext)
  if (!ctx) throw new Error('useLists debe usarse dentro de ListsProvider')
  return ctx
}