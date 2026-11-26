/** Un aviso de la barra de anuncios. */
export type Announcement = {
  text: string;
  /**
   * Link opcional: una ruta del sitio ("/backup") o una URL externa
   * ("https://…"). Al pasar el mouse la barra se detiene para poder tocarlo.
   */
  to?: string;
};

/**
 * Avisos de la barra debajo del navbar (`AnnouncementBar`). Se muestran en una
 * sola línea que se desplaza de derecha a izquierda, uno detrás de otro.
 * Con la lista vacía la barra no aparece. Los cambios se publican con un push.
 */
export const ANNOUNCEMENTS: Announcement[] = [
  {
    text: "Welcome!",
  },
  {
    text: "This website is a work in progress",
  },
  {
    text: "Please, any feedback or thougths are welcomed, use our feedback/contact page",
    to: "/feedback",
  },
  {
    text: "Bienvenido!",
  },
  {
    text: "You are the Gogoat!",
    to: "/details/673",
  },
  {
    text: "We are considering a language feature to translate the website, let us know if this interests you",
  },
  {
    text: "You can export and import data between PC and Mobile",
    to: "/backup",
  },
];
