import { useState } from "react";
import { SpriteImg } from "../SpriteImg";
import { useRevealOnOpen } from "../../hooks/useRevealOnOpen";
import { cdnSprite, itemArtUrls } from "../../lib/sprites";
import {
  prettyName,
  itemShortEffect,
  itemEffect,
  itemFlavor,
  itemGeneration,
  genLabel,
} from "../../lib/items";
import type { Item } from "../../types/item";
import {
  CloseButton,
  FlavorAndEffect,
  InfoCells,
  type InfoCell,
} from "../lists/RowParts";

/** Uso del objeto deducido de sus atributos de la API (equipable, consumible, etc.). */
function usedFor(item: Item): string {
  const uses: string[] = [];
  const attrs = item.attributes.map((a) => a.name);
  if (attrs.includes("usable-in-battle")) uses.push("Battle");
  if (attrs.includes("usable-overworld")) uses.push("Overworld");
  if (item.machines.length > 0) uses.push("TM / HM");
  return uses.join(", ");
}

/** Imagen grande de un objeto: prueba las URLs de `itemArtUrls` en orden y, si fallan todas, usa el sprite pixelado. */
function ItemArt({
  name,
  fallback,
  alt,
}: {
  name: string;
  fallback: string;
  alt: string;
}) {
  const urls = [...itemArtUrls(name), fallback].filter(Boolean);
  const [i, setI] = useState(0);
  const src = urls[i];
  const pixel = src === fallback;

  return (
    <SpriteImg
      src={src}
      alt={alt}
      // El sprite pixelado se escala menos y sin suavizado
      className={`${pixel ? "w-12 h-12" : "w-16 h-16"} object-contain`}
      style={pixel ? { imageRendering: "pixelated" } : undefined}
      onError={() => setI((n) => Math.min(n + 1, urls.length - 1))}
    />
  );
}

/**
 * Fila de la lista de objetos. Cerrada muestra sprite, nombre, categoría y
 * efecto corto; abierta, una tarjeta con imagen grande, textos completos y datos.
 */
export function ItemRow({
  item,
  open,
  onToggle,
}: {
  item: Item;
  open: boolean;
  onToggle: () => void;
}) {
  const ref = useRevealOnOpen<HTMLDivElement>(open);
  const sprite = cdnSprite(item.sprites.default);
  const name = prettyName(item.name);

  if (!open) {
    return (
      <button className="item-row" onClick={onToggle}>
        <span className="item-cell item-cell-name">
          {/* Sin sprite no se monta SpriteImg, para no dejar fijo el indicador de carga */}
          <span className="item-sprite">
            {sprite && <SpriteImg src={sprite} alt="" />}
          </span>
          {name}
        </span>
        <span className="item-cell item-cell-cat">
          {prettyName(item.category.name)}
        </span>
        <span className="item-cell item-cell-effect">
          {itemShortEffect(item)}
        </span>
        <span className="item-plus" aria-hidden="true">
          +
        </span>
      </button>
    );
  }

  const gen = genLabel(itemGeneration(item));
  const short = itemShortEffect(item);
  const flavor = itemFlavor(item);
  const effect = itemEffect(item);
  const holders = item.held_by_pokemon.map((h) => prettyName(h.pokemon.name));

  // Solo las celdas con dato
  const cells: InfoCell[] = [];
  if (item.attributes.length)
    cells.push({
      label: "Attributes",
      value: item.attributes.map((a) => prettyName(a.name)).join(", "),
    });
  if (item.fling_power !== null)
    cells.push({ label: "Fling Power", value: String(item.fling_power) });
  if (item.fling_effect)
    cells.push({
      label: "Fling Effect",
      value: prettyName(item.fling_effect.name),
    });
  if (usedFor(item)) cells.push({ label: "Used for", value: usedFor(item) });
  if (holders.length)
    cells.push({ label: "Held by", value: holders.join(", ") });

  return (
    <div ref={ref} className="item-expanded">
      <CloseButton onClick={onToggle} />

      <div className="flex items-center gap-4">
        {" "}
        <div className="w-20 h-20 flex-shrink-0 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
          <ItemArt name={item.name} fallback={sprite} alt={name} />
        </div>
        <div className="flex-1 min-w-0 pr-8">
          {" "}
          <h3 className="text-2xl font-bold text-gray-900 leading-tight">
            {name}
          </h3>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mt-1">
            {prettyName(item.category.name)}
            {gen && ` · ${gen}`}
          </p>
        </div>
      </div>

      {/* Descripción corta, a todo el ancho */}
      {short && <p className="text-gray-700 mt-3 leading-relaxed">{short}</p>}

      <FlavorAndEffect flavor={flavor} effect={effect} />

      <InfoCells cells={cells} />
    </div>
  );
}
