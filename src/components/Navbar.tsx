import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import pokeball from "../assets/pokeball1.webp";

type NavItem = { to: string; label: string };

const homeLink: NavItem = { to: "/", label: "Home" };

// Cada sección es un desplegable en escritorio y un grupo en mobile
const sections: { label: string; links: NavItem[] }[] = [
  {
    label: "Pokédex",
    links: [
      { to: "/dxg", label: "Pokédex Search" },
      { to: "/dex-stats", label: "Pokédex by Stats" },
    ],
  },
  {
    label: "More data",
    links: [
      { to: "/items", label: "Items" },
      { to: "/abilities", label: "Abilities" },
      { to: "/moves", label: "Moves" },
    ],
  },
  {
    label: "Your PC",
    links: [
      { to: "/favorites", label: "Favorites" },
      { to: "/lists", label: "Lists" },
      { to: "/team-planner", label: "Team Planner" },
    ],
  },
];

// Un desplegable con su propio estado: cada uno se abre y cierra solo
function NavDropdown({ label, links }: { label: string; links: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const location = useLocation();

  // Si estás en una de sus páginas, el botón toma ese nombre
  const active = links.find((l) => location.pathname.startsWith(l.to));

  // Al navegar, se cierra
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Cerrar al clickear afuera o con Escape
  useEffect(() => {
    if (!open) return;

    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <li className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`px-3 py-1 rounded transition flex items-center gap-1.5 cursor-pointer ${
          active ? "bg-red-700" : "hover:bg-red-700"
        }`}
      >
        {active?.label ?? label}
        <span
          className={`text-[0.6em] transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {open && (
        <ul className="absolute right-0 top-full mt-2 min-w-40 bg-red-600 rounded-lg shadow-xl overflow-hidden z-50">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `block px-4 py-2 whitespace-nowrap transition ${
                    isActive ? "bg-red-700" : "hover:bg-red-700"
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // El título se muestra 2 segundos al cargar y después se esconde
  const [showTitle, setShowTitle] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowTitle(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // Cierra el menú si la ventana pasa a tamaño escritorio
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 640) setMenuOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Al navegar, cerrar el menú móvil
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1 rounded transition ${isActive ? "bg-red-700" : "hover:bg-red-700"}`;

  // 45px de alto para el dedo
  const mobileLink =
    "text-white font-semibold hover:bg-red-700 px-3 min-h-[45px] flex items-center rounded transition";

  return (
    <nav className="bg-red-600 shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          aria-label="MekaDragon's Pokédex"
          className="group flex items-center"
        >
          <img src={pokeball} alt="" className="w-12 h-12 shrink-0" />
          {/* El título se esconde detrás de la Pokéball; vuelve a salir con hover */}
          <div
            className={`grid transition-all duration-700 ease-in-out motion-reduce:transition-none group-hover:grid-cols-[1fr] group-hover:opacity-100 ${
              showTitle
                ? "grid-cols-[1fr] opacity-100"
                : "grid-cols-[0fr] opacity-0"
            }`}
          >
            <div className="min-w-0 overflow-hidden flex justify-end">
              <h1 className="pl-3 shrink-0 text-lg sm:text-2xl font-bold tracking-wide whitespace-nowrap">
                MekaDragon's Pokédex
              </h1>
            </div>
          </div>
        </Link>

        {/* Links de escritorio */}
        <ul
          id="nav-links"
          className="flex items-center gap-1 sm:gap-4 text-sm sm:text-base font-semibold"
        >
          <li>
            <NavLink to={homeLink.to} end className={linkClass}>
              {homeLink.label}
            </NavLink>
          </li>

          {sections.map((s) => (
            <NavDropdown key={s.label} label={s.label} links={s.links} />
          ))}
        </ul>

        {/* Hamburguesa */}
        <button
          id="hamburger-btn"
          className="text-white text-2xl font-bold -mr-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Menú móvil: los desplegables van aplanados, con su título */}
      <div id="mobile-menu" className={menuOpen ? "open" : ""}>
        <NavLink to={homeLink.to} end className={mobileLink}>
          {homeLink.label}
        </NavLink>

        {sections.map((s) => (
          <div key={s.label} className="contents">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-white/60 px-3 pt-2">
              {s.label}
            </span>
            {s.links.map((l) => (
              <NavLink key={l.to} to={l.to} className={mobileLink}>
                {l.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
