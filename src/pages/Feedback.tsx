import { useState } from "react";
import type { FormEvent } from "react";

// La Access Key de Web3Forms es pública: solo sirve para mandarte mensajes a vos
const WEB3FORMS_KEY = "da148403-87b9-4da4-ba6a-dfe1b458bd15";

type Status = "idle" | "sending" | "sent" | "error";

const inputClass =
  "w-full px-3 min-h-[45px] sm:min-h-0 sm:py-2 border border-gray-300 rounded-lg text-base sm:text-sm focus:outline-none focus:border-red-500";

export function Feedback() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // evita que el navegador recargue la página
    const form = e.currentTarget; // se guarda antes del await, después deja de existir
    setStatus("sending");

    const data = new FormData(form);
    data.append("access_key", WEB3FORMS_KEY);
    data.append("subject", `Pokédex feedback: ${data.get("topic")}`);
    data.append("from_name", "MekaDragon's Pokédex");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Feedback</h1>

      {status === "sent" ? (
        <div className="bg-gray-100 rounded-lg p-6 flex flex-col items-center gap-3 text-center">
          <p className="text-lg font-bold text-gray-700">
            Thanks for your message!
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="px-5 min-h-[45px] sm:min-h-0 sm:py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition text-sm cursor-pointer"
          >
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-gray-600 leading-relaxed">
            Found a bug or have an idea? Let me know.
          </p>

          {/* Trampa para bots: es invisible, solo un bot la marcaría */}
          <input
            type="checkbox"
            name="botcheck"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
            Topic
            <select name="topic" className={inputClass} defaultValue="Bug">
              <option>Bug</option>
              <option>Suggestion</option>
              <option>Other</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
            Name (optional)
            <input type="text" name="name" className={inputClass} />
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
            Email (optional, if you want a reply)
            <input type="email" name="email" className={inputClass} />
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
            Message
            <textarea
              name="message"
              required
              rows={6}
              className={`${inputClass} py-2`}
            />
          </label>

          {status === "error" && (
            <p className="text-sm text-red-600">
              Something went wrong. Please try again later.
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="self-start px-5 min-h-[45px] sm:min-h-0 sm:py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition text-sm cursor-pointer disabled:opacity-50 disabled:cursor-wait"
          >
            {status === "sending" ? "Sending..." : "Send"}
          </button>
        </form>
      )}
    </div>
  );
}
