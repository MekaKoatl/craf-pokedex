import { Link } from "react-router-dom";
import pokeball from "../assets/pokeball1.webp";

type Props = { title?: string; message?: string };

/** Mensaje 404 con links a Home y a la Pokédex. Lo usan la página 404 y Details. */
export function NotFoundMessage({
  title = "This Pokémon fled!",
  message = "The page you're looking for doesn't exist or was moved.",
}: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center text-center gap-4">
      <img src={pokeball} alt="" className="w-20 h-20 grayscale opacity-60" />
      <p className="text-6xl font-bold text-red-600">404</p>
      <h1 className="text-xl font-bold text-gray-700">{title}</h1>
      <p className="text-gray-500 text-sm">{message}</p>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        <Link
          to="/"
          className="btn-primary px-5 min-h-[45px] sm:min-h-0 sm:py-2 flex items-center rounded-lg text-sm"
        >
          Back to Home
        </Link>
        <Link
          to="/dxg"
          className="px-5 min-h-[45px] sm:min-h-0 sm:py-2 flex items-center border border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition text-sm"
        >
          Pokédex Search
        </Link>
      </div>
    </div>
  );
}
