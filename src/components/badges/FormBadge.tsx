import type { FormBadge as FormBadgeType } from "../../types/pokemon";

/** Insignia de forma (Mega, Gigamax, regional, legendario...), con la clase `form-badge-{forma}`. */
export function FormBadge({ form }: { form: FormBadgeType }) {
  return <span className={`form-badge form-badge-${form}`}>{form}</span>;
}
