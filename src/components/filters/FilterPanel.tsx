import { useState } from 'react'
import { FilterPill } from './FilterPill'

export interface PillOption {
  value: string | number
  label: string
}

export function FilterPanel({
  label,
  options,
  activeValues,
  isType = false,
  onToggle,
  onClear,
}: {
  label: string
  options: PillOption[]
  activeValues: (string | number)[]
  isType?: boolean
  onToggle: (value: string | number) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const hasActive = activeValues.length > 0

  return (
    <div className="filter-dropdown-wrapper">
      <button
        className={`filter-dropdown-btn${hasActive ? ' filter-btn-active' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        {label} ▾
      </button>

      {open && (
        <div className="filter-dropdown-panel">
          <div className="panel-label-row">
            <div className="panel-label">{label}</div>
            <button className="panel-close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="panel-pills-row">
            {options.map((opt) => (
              <FilterPill
                key={opt.value}
                label={opt.label}
                active={activeValues.includes(opt.value)}
                isType={isType}
                typeName={isType ? String(opt.value) : undefined}
                onClick={() => onToggle(opt.value)}
              />
            ))}
          </div>
          <div className="panel-footer">
            <button className="panel-apply-btn" onClick={() => setOpen(false)}>Apply</button>
            <button className="panel-clear-link" onClick={onClear}>Clear</button>
          </div>
        </div>
      )}
    </div>
  )
}