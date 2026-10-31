export function ComingSoon({ title }: { title: string }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
        <p className="text-gray-500 font-semibold">Coming soon</p>
        <p className="text-sm text-gray-400 mt-1">
          This section is under construction.
        </p>
      </div>
    </section>
  );
}