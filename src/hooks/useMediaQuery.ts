import { useEffect, useState } from "react";

/**
 * Indica si se cumple una media query de CSS y se actualiza cuando cambia.
 *
 * @example
 * const wide = useMediaQuery("(min-width: 1024px)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
