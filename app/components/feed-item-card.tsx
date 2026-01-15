import Link from "next/link"
import { getRelativeTime } from "@/lib/utils"
import { UpvoteButton } from "@/app/components/upvote-button"
import { ShareButton } from "@/app/components/share-button"
import { CommentIcon } from "@/app/components/icons"
import type { SoftwareItem } from "@/app/page"

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
    <li className="group rounded-xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm">
      <div className="flex items-start justify-between gap-6">
        {/* Main content */}
        <div className="flex gap-4 flex-1 min-w-0">
          {/* Thumbnail */}
          {item.thumbnail && (
            <img
              src={item.thumbnail}
              alt={item.name}
              className="h-16 w-16 flex-shrink-0 rounded-lg border border-gray-200 object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and time */}
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <Link
                href={`/product/${item.id}`}
                className="text-xl font-semibold leading-tight text-gray-900 transition-colors hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
              >
                {item.name}
              </Link>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {getRelativeTime(item.createdAt)}
              </span>
            </div>
            
            {/* Tagline */}
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600 line-clamp-2">
              {item.tagline}
            </p>
            
            {/* Categories and Maker */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Categories */}
              {item.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.categories.slice(0, 3).map((category) => (
                    <Link
                      key={category.id}
                      href={`/?category=${category.slug}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-700"
                    >
                      {category.name}
                    </Link>
                  ))}
                  {item.categories.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{item.categories.length - 3} more
                    </span>
                  )}
                </div>
              )}
              
              {/* Maker attribution */}
              {item.maker && (
                <span className="text-xs text-gray-500">
                  by{" "}
                  <Link
                    href={`/maker/${item.maker}`}
                    className="font-medium text-gray-700 transition-colors hover:text-gray-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-700 rounded"
                  >
                    @{item.maker}
                  </Link>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Upvote button */}
          <UpvoteButton 
            id={item.id} 
            upvotes={item.upvotes} 
            hasUpvoted={hasUpvoted}
            isLoggedIn={isLoggedIn}
            variant="compact"
          />
          
          {/* Comment count */}
          <Link
            href={`/product/${item.id}#comments`}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 rounded"
            title="Comment"
            aria-label={`${item.commentCount} comments`}
          >
            <CommentIcon />
            <span className="text-sm font-medium">{item.commentCount}</span>
          </Link>
          
          {/* Share button */}
          <ShareButton productId={item.id} productName={item.name} />
        </div>
      </div>
    </li>
  )
}
