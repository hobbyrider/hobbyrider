import Link from "next/link"
import Image from "next/image"
import { UpvoteButton } from "@/app/components/upvote-button"
import { ShareButton } from "@/app/components/share-button"
import type { SoftwareItem } from "@/app/(main)/page"
import { CardTitle, Small } from "@/app/components/typography"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getProductUrl } from "@/lib/slug"

type FeedItemCardProps = {
  item: SoftwareItem
  hasUpvoted: boolean
  isLoggedIn: boolean
}

/**
 * FeedItemCard - Displays a product in the feed
 * 
 * Design principles:
 * - Clear hierarchy: title > tagline > metadata
 * - Consistent spacing (16px base unit)
 * - Subtle hover states
 * - Accessible focus states
 */
export function FeedItemCard({ item, hasUpvoted, isLoggedIn }: FeedItemCardProps) {
  return (
    <li>
      <Card className="group transition-all duration-200 hover:shadow-sm">
        <CardContent className="p-4 sm:p-5">
          {/* Mobile: Title row with actions on the right */}
          <div className="flex items-start justify-between gap-3 sm:hidden mb-3">
            <div className="flex-1 min-w-0">
              <Link
                href={getProductUrl(item.slug || null, item.id)}
                className="transition-colors hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
              >
                <CardTitle className="text-lg text-gray-900">{item.name}</CardTitle>
              </Link>
            </div>
            {/* Actions on mobile - top right */}
            <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
              <UpvoteButton 
                id={item.id} 
                upvotes={item.upvotes} 
                hasUpvoted={hasUpvoted}
                isLoggedIn={isLoggedIn}
                variant="compact"
              />
              <ShareButton productId={item.id} productName={item.name} productSlug={item.slug} />
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden sm:flex sm:flex-row sm:items-start sm:justify-between gap-6">
            {/* Main content */}
            <div className="flex gap-4 flex-1 min-w-0">
              {/* Thumbnail */}
              {item.thumbnail && (
                <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden relative bg-white">
                  <Image
                    src={item.thumbnail}
                    alt={item.name}
                    fill
                    className="object-contain p-2 transition-transform duration-200 group-hover:scale-[1.02]"
                    sizes="64px"
                    loading="lazy"
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <div>
                  <Link
                    href={getProductUrl(item.slug || null, item.id)}
                    className="transition-colors hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                  >
                    <CardTitle className="text-xl text-gray-900">{item.name}</CardTitle>
                  </Link>
                </div>
                
                {/* Tagline */}
                <Small className="mt-1.5 text-gray-600 line-clamp-2 text-sm">
                  {item.tagline}
                </Small>
                
                {/* Categories */}
                {item.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {item.categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/?category=${category.slug}`}
                        className="focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-700 rounded"
                      >
                        <Badge variant="secondary" className="text-xs font-medium cursor-pointer">
                          {category.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions - desktop */}
            <div className="flex items-center gap-4 flex-shrink-0 self-start whitespace-nowrap">
              <UpvoteButton 
                id={item.id} 
                upvotes={item.upvotes} 
                hasUpvoted={hasUpvoted}
                isLoggedIn={isLoggedIn}
                variant="compact"
              />
              <ShareButton productId={item.id} productName={item.name} productSlug={item.slug} />
            </div>
          </div>

          {/* Mobile: Content below title */}
          <div className="sm:hidden">
            <div className="flex gap-3">
              {/* Thumbnail */}
              {item.thumbnail && (
                <div className="h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden relative bg-white">
                  <Image
                    src={item.thumbnail}
                    alt={item.name}
                    fill
                    className="object-contain p-2 transition-transform duration-200 group-hover:scale-[1.02]"
                    sizes="56px"
                    loading="lazy"
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Tagline */}
                <Small className="text-gray-600 line-clamp-2 text-xs">
                  {item.tagline}
                </Small>
                
                {/* Categories */}
                {item.categories.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {item.categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/?category=${category.slug}`}
                        className="focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-700 rounded"
                      >
                        <Badge variant="secondary" className="text-xs font-medium cursor-pointer">
                          {category.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </li>
  )
}
