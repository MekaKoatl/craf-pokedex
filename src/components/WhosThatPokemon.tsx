import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDailyPokemon } from "../hooks/useDailyPokemon";
import { getTodayKey, msUntilMidnight, formatCountdown } from "../lib/daily";
import { getRegionalDisplayName } from "../lib/regional";
import { cdnSprite } from "../lib/sprites";
import { TypeBadge } from "./badges/TypeBadge";

type Status = "hidden" | "guessing" | "revealed" | "solved";

export function WhosThatPokemon() {
  const { data } = useDailyPokemon();
  const storageKey = `craf-wtp-${getTodayKey()}`;

  // Si ya lo resolvió hoy, arranca destapado
  const [status, setStatus] = useState<Status>(() => {
    try {
      return (localStorage.getItem(storageKey) as Status) || "hidden";
    } catch {
      return "hidden";
    }
  });
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

  // Contador cada segundo
  useEffect(() => {
    const t = setInterval(() => setLeft(msUntilMidnight()), 1000);
    return () => clearInterval(t);
  }, []);

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

  const isOpen = status === "revealed" || status === "solved";

  function handleGuess(e: React.FormEvent) {
    e.preventDefault();
    const limpio = guess.trim().toLowerCase();
    if (limpio === pokemon.name.toLowerCase() || limpio === name.toLowerCase()) {
      setStatus("solved");
    } else {
      setWrong(true);
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 pt-8">
      <div className="bg-red-600 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
        {/* Silueta o sprite */}
        <div className="w-44 h-44 flex-shrink-0 flex items-center justify-center">
          <img
            src={sprite}
            alt={isOpen ? name : "Silueta"}
            className="w-full h-full object-contain transition-all duration-500"
            style={{ filter: isOpen ? "none" : "brightness(0)" }}
          />
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
                <form onSubmit={handleGuess} className="flex gap-2 justify-center sm:justify-start">
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
                <h2 className="text-3xl font-bold hover:underline">
                  #{String(pokemon.id).padStart(3, "0")} — {name}
                </h2>
              </Link>
              <p className="text-sm opacity-90 mt-2 leading-relaxed">{flavor}</p>
              <div className="flex gap-2 mt-3 justify-center sm:justify-start">
                {pokemon.types.map((t) => (
                  <TypeBadge key={t.type.name} type={t.type.name} />
                ))}
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