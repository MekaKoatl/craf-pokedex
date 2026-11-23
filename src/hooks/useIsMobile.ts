import { useMediaQuery } from "./useMediaQuery";

/** Indica si la pantalla tiene ancho de celular (menos de 640px, el `sm:` de Tailwind) y se actualiza al cambiar el tamaño. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 639px)");
}
