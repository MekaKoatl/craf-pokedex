import { useEffect, useRef } from "react";

/**
 * Al abrirse un elemento que quedó fuera de la vista (arriba de la pantalla
 * o en su último cuarto), hace scroll suave hasta él.
 *
 * @param open Si el elemento está abierto.
 * @returns Ref para asignar al elemento.
 */
export function useRevealOnOpen<T extends HTMLElement>(open: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open || !ref.current) return;
    const { top } = ref.current.getBoundingClientRect();
    if (top < 0 || top > window.innerHeight * 0.75) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [open]);

  return ref;
}
