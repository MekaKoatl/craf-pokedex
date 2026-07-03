import { useState } from 'react'

export function ImageModal({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false)

  async function download() {
    try {
      const res = await fetch(src)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${alt || 'pokemon'}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(src, '_blank') // respaldo
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-2 right-2 rounded-full w-8 h-8 flex items-center justify-center text-lg transition"
        title="Expand"
      >🔍</button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        >
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl p-4 max-w-lg w-full flex flex-col items-center gap-4">
            <img src={src} alt={alt} className="w-full max-h-[70vh] object-contain" />
            <div className="flex gap-3">
              <button onClick={download} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition">Download</button>
              <button onClick={() => setOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}