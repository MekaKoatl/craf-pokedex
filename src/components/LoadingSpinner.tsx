export function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="loading-spinner">
      <div className="pokeball-spinner"><div className="pokeball-line" /></div>
      <p className="loading-text">{text}</p>
    </div>
  )
}