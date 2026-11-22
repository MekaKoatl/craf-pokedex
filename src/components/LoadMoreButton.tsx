type Props = {
  show: boolean;
  loading?: boolean;
  onClick: () => void;
};

// Botón "Load More" de las listas que cargan de a partes
export function LoadMoreButton({ show, loading = false, onClick }: Props) {
  if (!show) return null;
  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={onClick}
        disabled={loading}
        className="min-h-[45px] sm:min-h-0 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition cursor-pointer disabled:opacity-50"
      >
        {loading ? "Loading..." : "Load More"}
      </button>
    </div>
  );
}