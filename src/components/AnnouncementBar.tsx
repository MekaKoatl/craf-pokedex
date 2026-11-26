import { useState } from "react";
import { Link } from "react-router-dom";
import { ANNOUNCEMENTS, type Announcement } from "../lib/announcements";

/** Segundos de recorrido por carácter: define la velocidad del texto. */
const SECONDS_PER_CHAR = 0.5;
/** Duración mínima de una vuelta, para que los textos cortos no corran. */
const MIN_SECONDS = 20;

/** Un aviso: texto solo o link (interno con `Link`, externo en otra pestaña). */
function Item({ text, to }: Announcement) {
  if (!to) return <span>{text}</span>;
  if (to.startsWith("http")) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        {text}
      </a>
    );
  }
  return (
    <Link to={to} className="underline">
      {text}
    </Link>
  );
}

/**
 * Barra fina debajo del navbar con los avisos de `src/lib/announcements.ts`,
 * en una sola línea que se desplaza de derecha a izquierda (se detiene al
 * pasar el mouse). La ✕ la oculta hasta que se recarga la página.
 */
export function AnnouncementBar() {
  const [hidden, setHidden] = useState(false);
  if (hidden || ANNOUNCEMENTS.length === 0) return null;

  const chars = ANNOUNCEMENTS.reduce((n, a) => n + a.text.length, 0);
  const duration = Math.max(MIN_SECONDS, chars * SECONDS_PER_CHAR);
  const items = ANNOUNCEMENTS.map((a, i) => <Item key={i} {...a} />);

  return (
    <div className="announce-bar" role="region" aria-label="Announcements">
      <div className="announce-mask">
        {/* Dos copias seguidas: al terminar la primera, la vuelta no se nota */}
        <div
          className="announce-track"
          style={{ animationDuration: `${duration}s` }}
        >
          <div className="announce-group">{items}</div>
          <div className="announce-group" aria-hidden="true">
            {items}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="announce-close"
        aria-label="Hide announcements"
        onClick={() => setHidden(true)}
      >
        ✕
      </button>
    </div>
  );
}