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

// Para qué sirve, deducido de sus atributos
function usedFor(item: Item): string {
  const uses: string[] = [];
  const attrs = item.attributes.map((a) => a.name);
  if (attrs.includes("usable-in-battle")) uses.push("Battle");
  if (attrs.includes("usable-overworld")) uses.push("Overworld");
  if (item.machines.length > 0) uses.push("TM / HM");
  return uses.join(", ");
}

// La imagen más grande que exista: HD → Dream World → el pixel de siempre.
// Si una falla (onError), pasa a la siguiente.
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
      // El pixel se agranda menos y sin suavizar; el arte, más grande
      className={`${pixel ? "w-12 h-12" : "w-16 h-16"} object-contain`}
      style={pixel ? { imageRendering: "pixelated" } : undefined}
      onError={() => setI((n) => Math.min(n + 1, urls.length - 1))}
    />
  );
}

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
          {/* El sprite va dentro de un círculo. Sin sprite no se monta
              SpriteImg, si no queda el gif de carga fijo */}
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

  // Solo se arman las celdas que tienen dato
  const cells: { label: string; value: string }[] = [];
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
      <button
        onClick={onToggle}
        title="Close"
        className="absolute top-1 right-1 w-[45px] h-[45px] flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-lg cursor-pointer"
      >
        ✕
      </button>

      {/* Encabezado */}
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

      {/* La descripción corta va debajo del encabezado, a todo el ancho */}
      {short && <p className="text-gray-700 mt-3 leading-relaxed">{short}</p>}

      {/* Flavor */}
      {flavor && (
        <blockquote className="mt-4 border-l-4 border-red-400 pl-3 text-sm italic text-gray-500">
          {flavor}
        </blockquote>
      )}

      {/* Efecto */}
      {effect && (
        <div className="mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">
            Effect
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {effect}
          </p>
        </div>
      )}

      {/* Datos */}
      {cells.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {cells.map((c) => (
            <div
              key={c.label}
              className="bg-white border border-gray-200 rounded-lg p-3"
            >
              <h4 className="text-[0.65rem] font-bold uppercase tracking-wide text-gray-400 mb-1">
                {c.label}
              </h4>
              <p className="text-xs text-gray-700">{c.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
