import physicalIcon from "../../assets/movestypes/PhysicalIC_Champs.png";
import specialIcon from "../../assets/movestypes/SpecialIC_Champs.png";
import statusIcon from "../../assets/movestypes/StatusIC_Champs.png";

/** Ícono de cada categoría de daño. */
const ICONS: Record<string, string> = {
  physical: physicalIcon,
  special: specialIcon,
  status: statusIcon,
};

/** Pastilla de categoría de daño (physical, special o status) con su ícono y color. */
export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`move-cat move-cat-${category}`}>
      {ICONS[category] && (
        <img src={ICONS[category]} alt="" className="move-cat-icon" />
      )}
      {category}
    </span>
  );
}
