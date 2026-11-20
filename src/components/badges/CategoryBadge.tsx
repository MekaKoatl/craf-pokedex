import physicalIcon from "../../assets/movestypes/PhysicalIC_Champs.png";
import specialIcon from "../../assets/movestypes/SpecialIC_Champs.png";
import statusIcon from "../../assets/movestypes/StatusIC_Champs.png";

// Vite convierte cada import de imagen en su URL final
const ICONS: Record<string, string> = {
  physical: physicalIcon,
  special: specialIcon,
  status: statusIcon,
};

// Pastilla de categoría: ícono + nombre, con el color de cada una
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