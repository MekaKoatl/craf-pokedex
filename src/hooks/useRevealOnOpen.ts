import { useEffect, useRef } from "react";

// Cuando el elemento se abre y no está a la vista, hace scroll hasta él.
// Devuelve la ref que hay que poner en el elemento abierto.
export function useRevealOnOpen<T extends HTMLElement>(open: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open || !ref.current) return;
    const { top } = ref.current.getBoundingClientRect();
    // Arriba de la pantalla, o muy abajo: se lleva al principio
    if (top < 0 || top > window.innerHeight * 0.75) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [open]);

  return ref;
}