import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";

type NavItem = { to: string; label: string };

const homeLink: NavItem = { to: "/", label: "Home" };
const favLink: NavItem = { to: "/favorites", label: "Favorites" };

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

  const mobileLink =
    "text-white font-semibold hover:bg-red-700 px-3 py-2 rounded transition";

  return (
    <nav className="bg-red-600 shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <div className="flex items-center gap-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1280px-Pok%C3%A9_Ball_icon.svg.png"
              alt="Pokeball"
              className="w-8 h-8"
            />
            <h1 className="text-lg sm:text-2xl font-bold tracking-wide whitespace-nowrap">
              MekaDragon's Pokédex
            </h1>
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

          <li>
            <NavLink to={favLink.to} className={linkClass}>
              {favLink.label}
            </NavLink>
          </li>
        </ul>

        {/* Hamburguesa */}
        <button
          id="hamburger-btn"
          className="text-white text-2xl font-bold px-2"
          onClick={() => setMenuOpen((v) => !v)}
        >
          ☰
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

        <NavLink to={favLink.to} className={`${mobileLink} mt-2`}>
          {favLink.label}
        </NavLink>
      </div>
    </nav>
  );
}