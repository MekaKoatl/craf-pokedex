import { useState, useEffect } from "react";

/** Botón fijo para volver al inicio de la página; aparece después de bajar 400px. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll);
    onScroll(); // estado inicial, por si la página carga ya desplazada
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      title="Back to top"
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 w-[45px] h-[45px] rounded-full bg-red-600 text-white text-xl font-bold shadow-lg hover:bg-red-700 transition flex items-center justify-center cursor-pointer"
    >
      ↑
    </button>
  );
}
