// Las 54 categorías de la API agrupadas en los buckets que mostramos
export interface ItemGroup {
  key: string;
  label: string;
  categories: string[];
}

export const ITEM_GROUPS: ItemGroup[] = [
  { key: "all", label: "– All –", categories: [] },
  {
    key: "battle",
    label: "Battle items",
    categories: ["stat-boosts", "flutes", "miracle-shooter"],
  },
  {
    key: "berries",
    label: "Berries",
    categories: [
      "baking-only",
      "effort-drop",
      "in-a-pinch",
      "picky-healing",
      "type-protection",
    ],
  },
  {
    key: "general",
    label: "General items",
    categories: [
      "other",
      "collectibles",
      "evolution",
      "spelunking",
      "event-items",
      "gameplay",
      "plot-advancement",
      "loot",
      "all-mail",
      "mulch",
      "dex-completion",
      "species-candies",
      "catching-bonus",
      "dynamax-crystals",
      "curry-ingredients",
      "sandwich-ingredients",
      "tera-shard",
      "picnic",
      "data-cards",
    ],
  },
  {
    key: "hold",
    label: "Hold items",
    categories: [
      "held-items",
      "choice",
      "bad-held-items",
      "type-enhancement",
      "plates",
      "species-specific",
      "effort-training",
      "training",
      "scarves",
      "jewels",
      "mega-stones",
      "memories",
      "z-crystals",
    ],
  },
  {
    key: "machines",
    label: "Machines",
    categories: ["all-machines", "tm-materials"],
  },
  {
    key: "medicine",
    label: "Medicine",
    categories: [
      "medicine",
      "vitamins",
      "healing",
      "pp-recovery",
      "revival",
      "status-cures",
      "nature-mints",
    ],
  },
  {
    key: "pokeballs",
    label: "Pokeballs",
    categories: [
      "standard-balls",
      "special-balls",
      "apricorn-balls",
      "apricorn-box",
    ],
  },
  { key: "unknown", label: "Unknown", categories: ["unused"] },
];