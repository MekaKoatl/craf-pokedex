import { useContext } from 'react'
import { TeamsContext } from '../context/TeamsContext'

export function useTeams() {
  const ctx = useContext(TeamsContext)
  if (!ctx) throw new Error('useTeams debe usarse dentro de TeamsProvider')
  return ctx
}