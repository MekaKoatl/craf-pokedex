import type { ReactNode } from "react";

/** Preguntas frecuentes. La respuesta acepta texto o JSX. */
const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "Why not use one of the already existing databases?",
    a: (
      <>
        This was originally the first API test project I made for a school
        assignment, I then expanded when the course wanted to teach us React. I
        wanted to make a website that *I* would like to use as a Pokemon fan and
        player.
      </>
    ),
  },
  {
    q: "Was AI used in this website?",
    a: (
      <>
        Yes, I rather be upfront about it since I have been lied and gaslighted
        in the use of AI on other parts of the internet and my life.
        <br />
        <br />
        AI was used in the code and decoding of the website, I am more designer
        and fan than experienced developer, the course I took was to familiarize
        myself with essential coding tools and whenever said knowledge failed me
        is when I filled the gaps with machine.
        <br />
        <br />
        When AI came out I saw it as a potentially good tool for coding,
        medicine, research and search engines, an actual tool if you may.
        <br />
        And,then I saw that same exact "tool" be used to worsen the lives of
        most but a few at the top. I wish and want to use the tech as what I saw
        in the beginning, but sadly it seems that is not the vision the "world"
        has for it
      </>
    ),
  },
  {
    q: "What API did you use?",
    a: <>The Pokéapi; https://pokeapi.co/</>,
  },
  {
    q: "Why is there a diference or discrepancy between the sprites used for Pokémon across the site",
    a: (
      <>
        If you see a difference it is because I had an original idea or plan to
        use a specific sprite but it did not load or exist and I am using a
        backup.
        <br />
        <br />
        For example in the lists and teamplanners and other parts of the site I
        wanted to use the sprites used when accessing your boxes on the games
        "PC", however recent games and their mons don't always have this sprite.
        As such I have to have somre workarounds.
      </>
    ),
  },
  {
    q: "Why don't you/website does this or why does this not work",
    a: (
      <>
        If you have feedback, please fill the form which should exist and be
        accesible right now if I did not forget about it after writing this.
      </>
    ),
  },
  {
    q: "I have a recommendation for the website",
    a: (
      <>
        Again, please use the feedback form, I really appreciate any comments
        for recommendations or criticism.
      </>
    ),
  },
  {
    q: "'I could do this website better myself'",
    a: (
      <>
        If you mean that you are a developer and could do this fully by hand,
        then I fully agree and urge you to do so and contact me, this is the
        github: https://github.com/MekaKoatl/craf-pokedex.git, I would be very
        interested in having the website be fully human and only have the curent
        version be a sketch or preliminary version. And if its already done I do
        not mind changing or transfering the domain, I care that people can use
        the website, that it has what I care for and need for a Pokémon website
        and that my visual choices can be seen.
        <br />
        <br />
        If you mean that you can give your own AI the link of the website and
        tell it to do it better, then go eat some poor Trubbish.
      </>
    ),
  },
  {
    q: "Will you keep updating the website?",
    a: (
      <>
        Yeah probably, it depends on many things but it also depends of the
        PokeAPI. I probably will get annoyed at something I made with it and
        decide to change it.
      </>
    ),
  },
  {
    q: "What are your favorite Pokémon and games?",
    a: (
      <>
        Golurk, Ursaluna, Tyranitar, Arcanine.... if its big and cool and/or
        looks like a Dragon, Dinosaur, Golem, Bear or Dog, I probably like it.
        <br />
        <br />
        And the games I think I enjoy them all but the ones that came out when I
        was a kid where Heartgold onwards, so that one and the ones that came
        out after until I turned 20.
      </>
    ),
  },
];

/** Página FAQ (`/faq`): preguntas frecuentes en acordeón (`<details>`). */
export function FAQ() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl font-bold">FAQ</h1>

      <div className="flex flex-col gap-2">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="group bg-gray-100 rounded-lg open:bg-white open:shadow"
          >
            <summary className="flex items-center justify-between gap-3 px-4 min-h-[45px] sm:min-h-0 sm:py-3 cursor-pointer font-semibold list-none [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="text-xl font-bold text-red-600 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="px-4 pb-4 text-gray-600 leading-relaxed">{f.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
