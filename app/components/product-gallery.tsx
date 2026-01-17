"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

type ProductImage = {
  id: string
  url: string
  order: number
}

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]))
  const [isExpanded, setIsExpanded] = useState(false)

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

  const handleImageClick = () => {
    // Only open dialog on mobile devices
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setIsExpanded(true)
    }
  }

  const handleNext = () => {
    setSelectedIndex(
      selectedIndex === sortedImages.length - 1
        ? 0
        : selectedIndex + 1
    )
  }

  const handlePrevious = () => {
    setSelectedIndex(
      selectedIndex === 0
        ? sortedImages.length - 1
        : selectedIndex - 1
    )
  }

  return (
    <div>
      <div className="relative bg-gray-50">
        {/* Main image - clickable on mobile */}
        <div 
          className="aspect-video w-full overflow-hidden bg-white relative cursor-pointer sm:cursor-default active:opacity-90 sm:active:opacity-100 transition-opacity"
          onClick={handleImageClick}
        >
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
              onClick={(e) => {
                e.stopPropagation()
                handlePrevious()
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-black rounded-full p-2 sm:p-3 shadow-lg hover:bg-white transition border border-gray-200 z-10"
              aria-label="Previous image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-black rounded-full p-2 sm:p-3 shadow-lg hover:bg-white transition border border-gray-200 z-10"
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
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {sortedImages.length > 1 && (
        <div className="px-2 sm:px-4 py-3 sm:py-4 bg-white border-t border-gray-200">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all relative ${
                  selectedIndex === index
                    ? "border-gray-300 ring-2 ring-gray-200 ring-offset-1 sm:ring-offset-2"
                    : "border-gray-200 hover:border-gray-300 opacity-60 hover:opacity-100"
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

      {/* Full-screen expanded view for mobile */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-none w-screen h-screen m-0 p-0 gap-0 border-0 rounded-none bg-black/95 sm:hidden fixed inset-0 translate-x-0 translate-y-0 [&>button]:hidden">
          <DialogTitle className="sr-only">Expanded image view</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Expanded image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={sortedImages[selectedIndex].url}
                alt={`Screenshot ${selectedIndex + 1} - Full screen`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
                unoptimized={process.env.NODE_ENV === 'development'}
              />
            </div>

            {/* Navigation arrows */}
            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/30 transition z-10"
                  aria-label="Previous image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/30 transition z-10"
                  aria-label="Next image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-6 h-6"
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
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full">
                {selectedIndex + 1} / {sortedImages.length}
              </div>
            )}

            {/* Close button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white rounded-full p-2 hover:bg-black/70 transition z-10"
              aria-label="Close expanded view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M4.47 4.47a.75.75 0 011.06 0L10 8.94l4.47-4.47a.75.75 0 111.06 1.06L11.06 10l4.47 4.47a.75.75 0 11-1.06 1.06L10 11.06l-4.47 4.47a.75.75 0 01-1.06-1.06L8.94 10 4.47 5.53a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
