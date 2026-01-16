"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

type ProductImage = {
  id: string
  url: string
  order: number
}

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]))

  if (images.length === 0) return null

  const sortedImages = [...images].sort((a, b) => a.order - b.order)

  // Preload next image when current image is viewed
  useEffect(() => {
    const nextIndex = (selectedIndex + 1) % sortedImages.length
    if (!loadedImages.has(nextIndex)) {
      const img = new window.Image()
      img.src = sortedImages[nextIndex].url
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, nextIndex]))
      }
    }
  }, [selectedIndex, sortedImages, loadedImages])

  return (
    <div>
      <div className="relative bg-gray-50">
        {/* Main image */}
        <div className="aspect-video w-full overflow-hidden bg-white relative">
          <Image
            src={sortedImages[selectedIndex].url}
            alt={`Screenshot ${selectedIndex + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority={selectedIndex === 0}
            unoptimized={process.env.NODE_ENV === 'development'}
          />
        </div>

        {/* Navigation arrows */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={() =>
                setSelectedIndex(
                  selectedIndex === 0
                    ? sortedImages.length - 1
                    : selectedIndex - 1
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-black rounded-full p-3 shadow-lg hover:bg-white transition border border-gray-200"
              aria-label="Previous image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() =>
                setSelectedIndex(
                  selectedIndex === sortedImages.length - 1
                    ? 0
                    : selectedIndex + 1
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-black rounded-full p-3 shadow-lg hover:bg-white transition border border-gray-200"
              aria-label="Next image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </>
        )}

        {/* Image counter */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {sortedImages.length > 1 && (
        <div className="px-4 py-4 bg-white border-t">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all relative ${
                  selectedIndex === index
                    ? "border-black ring-2 ring-black ring-offset-2"
                    : "border-gray-200 hover:border-gray-400 opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                  loading="lazy"
                  unoptimized={process.env.NODE_ENV === 'development'}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
