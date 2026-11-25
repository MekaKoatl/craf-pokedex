/** Sitios y proyectos de la sección "Thanks to". */
const thanks = [
  { name: "PokéAPI", url: "https://pokeapi.co", note: "Pokémon data" },
  {
    name: "PokeAPI/sprites",
    url: "https://github.com/PokeAPI/sprites",
    note: "Sprites",
  },
  {
    name: "The Bulbagarden & Bulbapedia",
    url: "https://archives.bulbagarden.net/wiki/Main_Page",
    note: "Inspiration and OG",
  },
  {
    name: "The Pokémon Database",
    url: "https://pokemondb.net/",
    note: "Inspiration and OG",
  },
  {
    name: "Serebii.net",
    url: "https://www.serebii.net/",
    note: "Inspiration and OG",
  },
  {
    name: "The Pokémon Company",
    url: "https://www.pokemon.com/us",
    note: "For their amazing work and creativity",
  },
  {
    name: "Game Freak",
    url: "https://www.gamefreak.co.jp/",
    note: "For their amazing work and creativity",
  },
  {
    name: "Pokémon Showdown",
    url: "https://pokemonshowdown.com",
    note: "Team format",
  },
  {
    name: "PokéSprite",
    url: "https://github.com/msikma/pokesprite",
    note: "Box icons",
  },
];

/** Página Disclaimer & Thanks (`/disclaimer`): aviso legal y agradecimientos. */
export function Disclaimer() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">
      <h1 className="text-2xl sm:text-3xl font-bold">Disclaimer & Thanks</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Disclaimer</h2>
        <div className="text-gray-600 leading-relaxed">
          This website is not affiliated with Nintendo, Game Freak or The
          Pokémon Company.
          <br />
          <br />
          The website was made both as a fan and personal project and a small
          way to experiment with some things.
          <br />
          <br />
          The website uses the PokeAPI as its backbone, it is also heavily
          inspired by the work of already existing Pokémon databases and I would
          like to thank them;
          <ul className="list-disc pl-6 my-2">
            <li>The Pokémon Database</li>
            <li>Serebii</li>
            <li>The Bulbagarden websites</li>
            <li>PokéSprite</li>
          </ul>
          As also mentioned in the FAQ's, this website used AI in its
          development. I rather be upfront about it since I have been lied and
          gaslighted in the use of AI on other parts of the internet and my
          life.
          <br />
          AI was used in the code and decoding of the website, I am more
          designer and fan than experienced developer, I took courses to
          familiarize myself with essential coding tools and whenever said
          knowledge failed me is when I filled the gaps with machine.
          <br />
          <br />
          When AI came out I saw it as a potentially good tool for coding,
          medicine, research and search engines, an actual tool if you may.
          <br />
          <br />
          And,then I saw that same exact "tool" be used to worsen the lives of
          most but a few at the top. I wish and want to use the tech as what I
          saw in the beginning, but sadly it seems that is not the vision the
          "world" has for it
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Thanks to</h2>
        <p className="text-gray-600 leading-relaxed">
          Thank you to the minds behindn the Pokémon games, to the fans who
          developed the databases the fandom has relied on in the past, and to
          you for using this website
        </p>
        <ul className="flex flex-col gap-2">
          {thanks.map((t) => (
            <li key={t.url}>
              <a
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 px-4 min-h-[45px] sm:min-h-0 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <span className="font-semibold">{t.name}</span>
                <span className="text-sm text-gray-500">{t.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
