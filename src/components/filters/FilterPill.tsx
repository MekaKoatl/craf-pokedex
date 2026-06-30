export function FilterPill({
  label,
  active,
  isType = false,
  typeName,
  onClick,
}: {
  label: string
  active: boolean
  isType?: boolean
  typeName?: string
  onClick: () => void
}) {
  const colorClass = isType ? `pill-type-${typeName}` : 'pill-generic'
  return (
    <span
      className={`filter-pill ${colorClass}${active ? ' active' : ''}`}
      onClick={onClick}
    >
      {label}
    </span>
  )
}