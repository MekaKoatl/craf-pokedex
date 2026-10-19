import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDailyPokemon } from "../hooks/useDailyPokemon";
import { getTodayKey, msUntilMidnight, formatCountdown } from "../lib/daily";
import { getRegionalDisplayName } from "../lib/regional";
import { cdnSprite } from "../lib/sprites";
import { TypeBadge } from "./badges/TypeBadge";

type Status = "hidden" | "guessing" | "revealed" | "solved";

const GEN_MAP: Record<string, string> = {
  "generation-i": "I",
  "generation-ii": "II",
  "generation-iii": "III",
  "generation-iv": "IV",
  "generation-v": "V",
  "generation-vi": "VI",
  "generation-vii": "VII",
  "generation-viii": "VIII",
  "generation-ix": "IX",
};

function readStatus(key: string): Status {
  try {
    return (localStorage.getItem(key) as Status) || "hidden";
  } catch {
    return "hidden";
  }
}

export function WhosThatPokemon() {
  const { data } = useDailyPokemon();
  // El día vive en el estado, así React puede reaccionar cuando cambia
  const [dayKey, setDayKey] = useState(getTodayKey);
  const storageKey = `craf-wtp-${dayKey}`;

  const [status, setStatus] = useState<Status>(() => readStatus(storageKey));
  const [guess, setGuess] = useState("");
  const [wrong, setWrong] = useState(false);
  const [left, setLeft] = useState(msUntilMidnight);

  // Guarda solo los estados finales
  useEffect(() => {
    if (status === "revealed" || status === "solved") {
      try {
        localStorage.setItem(storageKey, status);
      } catch {
        // sin localStorage, se pierde al recargar
      }
    }
  }, [status, storageKey]);

  // Contador cada segundo; al cruzar la medianoche reinicia el juego
  useEffect(() => {
    const t = setInterval(() => {
      setLeft(msUntilMidnight());

      const hoy = getTodayKey();
      if (hoy !== dayKey) {
        setDayKey(hoy);
        setStatus(readStatus(`craf-wtp-${hoy}`));
        setGuess("");
        setWrong(false);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [dayKey]);

  if (!data) return null;

  const { pokemon, species } = data;
  const name = getRegionalDisplayName(pokemon.name);
  const sprite =
    cdnSprite(pokemon.sprites.other?.["official-artwork"]?.front_default) ||
    cdnSprite(pokemon.sprites.front_default);
  const flavor =
    species.flavor_text_entries
      .find((e) => e.language.name === "en")
      ?.flavor_text.replace(/\f|\n/g, " ") ?? "";
  const genus =
    species.genera.find((g) => g.language.name === "en")?.genus ?? "";
  const gen = GEN_MAP[species.generation?.name ?? ""] ?? "?";
  const habitat = species.habitat?.name ?? "Unknown";

  const isOpen = status === "revealed" || status === "solved";

  function handleGuess(e: React.FormEvent) {
    e.preventDefault();
    const limpio = guess.trim().toLowerCase();
    if (
      limpio === pokemon.name.toLowerCase() ||
      limpio === name.toLowerCase()
    ) {
      setStatus("solved");
    } else {
      setWrong(true);
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 pt-8">
      <div className="bg-red-600 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
        {/* Columna izquierda: sprite y, al revelar, los tipos */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <div className="wtp-sprite-box">
            <img
              src={sprite}
              alt={isOpen ? name : "Silueta"}
              className="w-full h-full object-contain transition-all duration-500 relative"
              style={{ filter: isOpen ? "none" : "brightness(0)" }}
            />
          </div>

          {isOpen && (
            <div className="wtp-types flex gap-2 justify-center">
              {pokemon.types.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} />
              ))}
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div className="flex-1 text-white text-center sm:text-left">
          {!isOpen ? (
            <>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
                Pokémon of the day
              </p>
              <h2 className="text-2xl font-bold mb-4">Who's that Pokémon???</h2>

              {status === "hidden" ? (
                <div className="flex gap-3 justify-center sm:justify-start">
                  <button
                    onClick={() => setStatus("revealed")}
                    className="px-5 py-2 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-red-600 transition"
                  >
                    Reveal
                  </button>
                  <button
                    onClick={() => setStatus("guessing")}
                    className="px-5 py-2 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-red-600 transition"
                  >
                    Guess
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleGuess}
                  className="flex gap-2 justify-center sm:justify-start"
                >
                  <input
                    value={guess}
                    onChange={(e) => {
                      setGuess(e.target.value);
                      setWrong(false);
                    }}
                    placeholder="Type the name..."
                    autoFocus
                    className={`px-3 py-2 rounded-lg text-sm text-gray-800 bg-white outline-none border-2 ${
                      wrong ? "border-yellow-300" : "border-transparent"
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-red-600 transition"
                  >
                    Guess
                  </button>
                </form>
              )}

              {wrong && (
                <p className="text-sm mt-2 text-yellow-200 font-semibold">
                  Not quite — try again!
                </p>
              )}
            </>
          ) : (
            <>
              {status === "solved" && (
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-200 mb-1">
                  You got it!
                </p>
              )}

              <Link to={`/details/${pokemon.id}`}>
                <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight hover:underline">
                  #{String(pokemon.id).padStart(2, "0")} {name}
                </h2>
              </Link>

              {genus && (
                <p className="italic text-white/70 text-sm mt-1">{genus}</p>
              )}

              <p className="text-sm mt-3 leading-relaxed">{flavor}</p>

              <div className="flex flex-wrap gap-x-8 gap-y-1 mt-4 text-xs font-bold italic justify-center sm:justify-start">
                <span>First appeared in: Gen {gen}</span>
                <span className="capitalize">Habitat: {habitat}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-center text-sm font-semibold text-gray-500 mt-3">
        Next Pokémon in: {formatCountdown(left)}
      </p>
    </section>
  );
}
