const ICON_BASE =
  "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/versions/generation-viii/icons";

export function cdnSprite(url: string | null | undefined): string {
  if (!url) return "";
  return url.replace(
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/",
    "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/",
  );
}

// La URL del icono de PC es predecible a partir del id
export function boxIconUrl(id: number): string {
  return `${ICON_BASE}/${id}.png`;
}

// Intenta cargar una imagen y dice si existe.
// Los iconos que existen responden en milisegundos; los que no, tardan
// segundos en dar 404, así que no vale la pena esperarlos.
export function imageExists(url: string, timeoutMs = 2500): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    let timer = 0;

    function finish(ok: boolean) {
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      // Apunta la imagen a un pixel vacío: eso cancela la descarga pendiente
      img.src =
        "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
      resolve(ok);
    }

    timer = window.setTimeout(() => finish(false), timeoutMs);
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = url;
  });
}
