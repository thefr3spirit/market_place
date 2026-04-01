import { useState } from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

export default function ProductGallery({ images = [] }) {
  const [current, setCurrent] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
        <span className="text-gray-400 text-lg">No Images</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={images[current]?.image_url}
          alt={`Product image ${current + 1}`}
          className="w-full h-full object-contain"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((p) => (p === 0 ? images.length - 1 : p - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow hover:bg-white"
            >
              <HiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrent((p) => (p === images.length - 1 ? 0 : p + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow hover:bg-white"
            >
              <HiChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id || i}
              onClick={() => setCurrent(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors
                ${current === i ? 'border-primary-400' : 'border-transparent'}`}
            >
              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
