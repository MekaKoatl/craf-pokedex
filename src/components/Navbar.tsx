import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/dxg", label: "General Dex Gallery" },
  { to: "/favorites", label: "Favorites" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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
              CRAF Pokédex
            </h1>
          </div>
        </Link>

        {/* Links de escritorio */}
        <ul
          id="nav-links"
          className="flex items-center gap-1 sm:gap-4 text-sm sm:text-base font-semibold"
        >
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-1 rounded transition ${isActive ? "bg-red-700" : "hover:bg-red-700"}`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
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

      {/* Menú móvil */}
      <div id="mobile-menu" className={menuOpen ? "open" : ""}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            onClick={() => setMenuOpen(false)}
            className="text-white font-semibold hover:bg-red-700 px-3 py-2 rounded transition"
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
