import { useState, useCallback } from "react";
import { LOADING_SPRITE } from "../lib/sprites";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & { src: string };

// Origen principal (CDN) y de respaldo de los sprites
const JSDELIVR = "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/";
const GITHUB_RAW = "https://raw.githubusercontent.com/PokeAPI/sprites/master/";

/**
 * `<img>` para sprites del repositorio PokeAPI/sprites.
 * - Muestra un Unown animado de fondo mientras carga.
 * - Si falla una URL de jsDelivr, reintenta una vez desde GitHub y recién
 *   entonces llama a `onError`.
 * - Usa carga diferida (`loading="lazy"`) por defecto.
 */
export function SpriteImg({
  src,
  alt = "",
  style,
  onError,
  loading = "lazy",
  decoding = "async",
  ...rest
}: Props) {
  // El estado se guarda por URL: al cambiar `src`, el de la imagen anterior
  // deja de aplicar sin necesidad de reiniciarlo.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [backupFor, setBackupFor] = useState<string | null>(null);

  const useBackup = backupFor === src;
  const finalSrc = useBackup ? src.replace(JSDELIVR, GITHUB_RAW) : src;
  const loaded = loadedSrc === finalSrc;

  // Una imagen en caché puede terminar de cargar antes de que React escuche
  // onLoad, así que al montarse (o cambiar de URL) se consulta `complete`.
  const checkCached = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth > 0) setLoadedSrc(finalSrc);
    },
    [finalSrc],
  );

  return (
    <img
      {...rest}
      loading={loading}
      decoding={decoding}
      ref={checkCached}
      src={finalSrc}
      alt={alt}
      onLoad={() => setLoadedSrc(finalSrc)}
      onError={(e) => {
        if (!useBackup && src.startsWith(JSDELIVR)) {
          setBackupFor(src);
          return;
        }
        setLoadedSrc(finalSrc); // quita el indicador de carga
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
