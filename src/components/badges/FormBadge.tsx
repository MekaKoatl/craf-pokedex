import type { FormBadge as FormBadgeType } from '../../types/pokemon'

export function FormBadge({ form }: { form: FormBadgeType }) {
  return <span className={`form-badge form-badge-${form}`}>{form}</span>
}