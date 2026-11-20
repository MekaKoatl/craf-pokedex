import { useState, useEffect, useRef } from "react";
import { LOADING_SPRITE } from "../lib/sprites";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & { src: string };

// Los sprites se piden a jsDelivr (un CDN, más rápido). Si falla,
// se vuelve a pedir el mismo archivo directo a GitHub.
const JSDELIVR = "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/";
const GITHUB_RAW = "https://raw.githubusercontent.com/PokeAPI/sprites/master/";

// loading="lazy": la imagen se descarga recién cuando te acercás a ella
export function SpriteImg({
  src,
  alt = "",
  style,
  onError,
  loading = "lazy",
  decoding = "async",
  ...rest
}: Props) {
  const [loaded, setLoaded] = useState(false);
  // true = jsDelivr ya falló y estamos probando con GitHub
  const [useBackup, setUseBackup] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  const finalSrc = useBackup ? src.replace(JSDELIVR, GITHUB_RAW) : src;

  // Al cambiar de imagen vuelve a mostrar el cargando y olvida el reintento.
  // Si ya estaba en caché, el navegador no dispara onLoad: hay que preguntarle.
  useEffect(() => {
    setLoaded(false);
    setUseBackup(false);
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, [src]);

  return (
    <img
      {...rest}
      loading={loading}
      decoding={decoding}
      ref={ref}
      src={finalSrc}
      alt={alt}
      onLoad={() => setLoaded(true)}
      onError={(e) => {
        // Primer fallo en jsDelivr: reintenta una vez desde GitHub
        if (!useBackup && src.startsWith(JSDELIVR)) {
          setUseBackup(true);
          return;
        }
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
