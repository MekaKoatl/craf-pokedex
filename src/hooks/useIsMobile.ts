import { useEffect, useState } from "react";

/** Corte de celular, igual al `sm:` de Tailwind (640px). */
const QUERY = "(max-width: 639px)";

/** Indica si la pantalla tiene ancho de celular (menos de 640px) y se actualiza al cambiar el tamaño. */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return mobile;
}
