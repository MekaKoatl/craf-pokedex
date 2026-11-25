import { Link } from "react-router-dom";

/** Links del pie de página. */
const footerLinks = [
  { to: "/faq", label: "FAQ" },
  { to: "/disclaimer", label: "Disclaimer & Thanks" },
  { to: "/feedback", label: "Feedback" },
];

/** Pie de página con los links secundarios y el aviso legal. */
export function Footer() {
  return (
    <footer className="bg-red-600 text-white mt-12">
      {/* pb-20 en celular: espacio para el botón de volver arriba */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-20 sm:pb-6 flex flex-col items-center gap-3 text-center">
        <ul className="flex flex-wrap justify-center gap-x-6 text-sm font-semibold">
          {footerLinks.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="min-h-[45px] sm:min-h-0 flex items-center hover:underline"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        {/* Aviso legal: siempre visible */}
        <p className="text-xs text-white/70">
          Fan-made project. Not affiliated with Nintendo, Game Freak or The
          Pokémon Company.
        </p>
        {/* Celular: link al texto completo */}
        <Link
          to="/disclaimer"
          className="sm:hidden min-h-[45px] flex items-center text-xs text-white/70 underline"
        >
          More in Disclaimer & Thanks
        </Link>
        {/* Escritorio: el resto del texto */}
        <div className="hidden sm:flex flex-col gap-1 max-w-2xl text-xs text-white/70">
          <p>
            Made for self use and for anyone that wants to use it. AI was used
            in the code and decoding and only on those areas of this website.
          </p>
          <p>
            The Pokémon API is the backbone of the website. Please use The
            Pokemon Database, Serebii and The Bulbagarden websites for more
            expansive Pokémon databases and pages.
          </p>
        </div>
      </div>
    </footer>
  );
}
