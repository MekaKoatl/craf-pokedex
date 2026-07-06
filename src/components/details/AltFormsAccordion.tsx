import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPokemon } from "../../lib/api";
import { getRegionalDisplayName } from "../../lib/regional";
import { TypeBadge } from "../badges/TypeBadge";
import type { Species, PokemonFull } from "../../types/pokemon";
import { cdnSprite } from "../../lib/sprites";

const STAT_COLORS: Record<string, string> = {
  hp: "#ef4444",
  attack: "#f97316",
  defense: "#eab308",
  "special-attack": "#3b82f6",
  "special-defense": "#22c55e",
  speed: "#a855f7",
};
const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SP.ATK",
  "special-defense": "SP.DEF",
  speed: "SPD",
};

function FormCard({
  name,
  baseStats,
}: {
  name: string;
  baseStats: PokemonFull["stats"];
}) {
  const [open, setOpen] = useState(false);
  const { data: p } = useQuery({
    queryKey: ["alt-form", name],
    queryFn: () => getPokemon(name) as Promise<PokemonFull>,
  });
  if (!p) return null;

  const isMega = name.includes("-mega");
  const tag = isMega ? "Mega" : "Gigantamax";

  return (
    <div className="form-alt-card">
      <div className="form-alt-header">
        <span
          className={`form-alt-tag ${isMega ? "form-alt-tag-mega" : "form-alt-tag-gmax"}`}
        >
          {tag}
        </span>
        <img
          className="form-alt-sprite"
          src={cdnSprite(p.sprites.other?.["official-artwork"]?.front_default)}
          alt={p.name}
        />
        <span className="form-alt-name">{getRegionalDisplayName(p.name)}</span>
        <div className="form-alt-types">
          {p.types.map((t) => (
            <TypeBadge key={t.type.name} type={t.type.name} />
          ))}
        </div>
      </div>
      <div className="form-alt-toggle" onClick={() => setOpen((v) => !v)}>
        <span>Stats & Abilities</span>
        <span>{open ? "−" : "+"}</span>
      </div>
      {open && (
        <div className="form-alt-accordion">
          <div className="form-alt-acc-label">Ability</div>
          <div className="flex flex-wrap gap-1 mb-3">
            {p.abilities.map((a) => (
              <span key={a.ability.name} className="form-alt-ability">
                {a.ability.name.replace(/-/g, " ")}
                {a.is_hidden ? " (Hidden)" : ""}
              </span>
            ))}
          </div>
          <div className="form-alt-acc-label">Base Stats</div>
          <div className="form-alt-stats">
            {p.stats.map((s) => {
              const base =
                baseStats.find((b) => b.stat.name === s.stat.name)?.base_stat ??
                s.base_stat;
              const diff = s.base_stat - base;
              return (
                <div key={s.stat.name} className="form-alt-stat-row">
                  <span className="form-alt-stat-name">
                    {STAT_LABELS[s.stat.name]}
                  </span>
                  <span className="form-alt-stat-val">{s.base_stat}</span>
                  <div className="form-alt-stat-bg">
                    <div
                      className="form-alt-stat-bar"
                      style={{
                        width: `${Math.min((s.base_stat / 255) * 100, 100)}%`,
                        background: STAT_COLORS[s.stat.name],
                      }}
                    />
                  </div>
                  <span
                    style={{
                      color: STAT_COLORS[s.stat.name],
                      fontSize: "10px",
                      fontWeight: 600,
                      width: "32px",
                      flexShrink: 0,
                    }}
                  >
                    {diff !== 0 ? (diff > 0 ? `+${diff}` : diff) : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function AltFormsAccordion({
  species,
  baseStats,
}: {
  species: Species;
  baseStats: PokemonFull["stats"];
}) {
  const forms = species.varieties
    .map((v) => v.pokemon.name)
    .filter((n) => n.includes("-mega") || n.includes("-gmax"));

  if (forms.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">
        Alternative Forms
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {forms.map((n) => (
          <FormCard key={n} name={n} baseStats={baseStats} />
        ))}
      </div>
    </div>
  );
}
