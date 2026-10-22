import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";

const mainLinks = [
  { to: "/", label: "Home" },
  { to: "/dxg", label: "Dex Search" },
];

// Las que viven dentro del desplegable
const dataLinks = [
  { to: "/items", label: "Items" },
  { to: "/abilities", label: "Abilities" },
];

const favLink = { to: "/favorites", label: "Favorites" };

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
  const dropRef = useRef<HTMLLIElement>(null);
  const location = useLocation();

  // Si estás en una de sus páginas, el botón toma ese nombre
  const activeData = dataLinks.find((l) => location.pathname.startsWith(l.to));
  const dataLabel = activeData?.label ?? "More data";

  // Cierra el menú si la ventana pasa a tamaño escritorio
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 640) setMenuOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Al navegar, cerrar todo
  useEffect(() => {
    setMenuOpen(false);
    setDataOpen(false);
  }, [location.pathname]);

  // Cerrar el desplegable al clickear afuera o con Escape
  useEffect(() => {
    if (!dataOpen) return;

    function onDown(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDataOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDataOpen(false);
    }

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [dataOpen]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1 rounded transition ${isActive ? "bg-red-700" : "hover:bg-red-700"}`;

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
          {mainLinks.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.to === "/"} className={linkClass}>
                {l.label}
              </NavLink>
            </li>
          ))}

          {/* Desplegable */}
          <li className="relative" ref={dropRef}>
            <button
              onClick={() => setDataOpen((v) => !v)}
              aria-expanded={dataOpen}
              aria-haspopup="true"
              className={`px-3 py-1 rounded transition flex items-center gap-1.5 cursor-pointer ${
                activeData ? "bg-red-700" : "hover:bg-red-700"
              }`}
            >
              {dataLabel}
              <span
                className={`text-[0.6em] transition-transform ${dataOpen ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>

            {dataOpen && (
              <ul className="absolute right-0 top-full mt-2 min-w-40 bg-red-600 rounded-lg shadow-xl overflow-hidden z-50">
                {dataLinks.map((l) => (
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

      {/* Menú móvil: el desplegable va aplanado */}
      <div id="mobile-menu" className={menuOpen ? "open" : ""}>
        {mainLinks.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className="text-white font-semibold hover:bg-red-700 px-3 py-2 rounded transition"
          >
            {l.label}
          </NavLink>
        ))}

        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-white/60 px-3 pt-2">
          More data
        </span>
        {dataLinks.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className="text-white font-semibold hover:bg-red-700 px-3 py-2 rounded transition"
          >
            {l.label}
          </NavLink>
        ))}

        <NavLink
          to={favLink.to}
          className="text-white font-semibold hover:bg-red-700 px-3 py-2 rounded transition mt-2"
        >
          {favLink.label}
        </NavLink>
      </div>
    </nav>
  );
}
