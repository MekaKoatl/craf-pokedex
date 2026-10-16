import { useState, useEffect, useRef } from "react";
import { LOADING_SPRITE } from "../lib/sprites";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & { src: string };

export function SpriteImg({ src, alt = "", style, onError, ...rest }: Props) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Al cambiar de imagen vuelve a mostrar el cargando.
  // Si ya estaba en caché, el navegador no dispara onLoad: hay que preguntarle.
  useEffect(() => {
    setLoaded(false);
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, [src]);

  return (
    <img
      {...rest}
      ref={ref}
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      onError={(e) => {
        setLoaded(true); // si falla, al menos deja de girar
        onError?.(e);
      }}
      style={{
        ...style,
        color: loaded ? undefined : "transparent",
        backgroundImage: loaded ? undefined : `url(${LOADING_SPRITE})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "45%",
      }}
    />
  );
}
