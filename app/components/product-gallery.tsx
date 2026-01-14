"use client"

import { useState } from "react"

type ProductImage = {
  id: string
  url: string
  order: number
}

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (images.length === 0) return null

  const sortedImages = [...images].sort((a, b) => a.order - b.order)

  return (
    <div className="mt-6">
      <div className="relative">
        {/* Main image */}
        <div className="aspect-video w-full rounded-lg overflow-hidden border bg-gray-100">
          <img
            src={sortedImages[selectedIndex].url}
            alt={`Screenshot ${selectedIndex + 1}`}
            className="w-full h-full object-contain"
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
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition"
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
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {sortedImages.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                selectedIndex === index
                  ? "border-black"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <img
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
