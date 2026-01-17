import Link from "next/link"
import Image from "next/image"
import { getRelativeTime } from "@/lib/utils"
import { UpvoteButton } from "@/app/components/upvote-button"
import { ShareButton } from "@/app/components/share-button"
import { CommentIcon } from "@/app/components/icons"
import type { SoftwareItem } from "@/app/(main)/page"
import { CardTitle, Small, Caption, NavLinkText } from "@/app/components/typography"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
        {/* Main content */}
        <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Thumbnail */}
          {item.thumbnail && (
            <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 rounded-lg border border-gray-200 overflow-hidden relative">
              <Image
                src={item.thumbnail}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 56px, 64px"
                loading="lazy"
              />
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div>
              <Link
                href={`/product/${item.id}`}
                className="transition-colors hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
              >
                <CardTitle className="text-lg sm:text-xl text-gray-900">{item.name}</CardTitle>
              </Link>
            </div>
            
            {/* Time and builder - on same line */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
              <Caption>
                {getRelativeTime(item.createdAt)}
              </Caption>
              {item.maker && (
                <>
                  <span className="text-gray-400">·</span>
                  <span>
                    by{" "}
                    <Link
                      href={`/user/${item.maker}`}
                      className="transition-colors hover:text-gray-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-700 rounded"
                    >
                      @{item.maker}
                    </Link>
                  </span>
                </>
              )}
            </div>
            
            {/* Tagline */}
            <Small className="mt-1.5 text-gray-600 line-clamp-2 text-xs sm:text-sm">
              {item.tagline}
            </Small>
            
            {/* Categories */}
            {item.categories.length > 0 && (
              <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
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

        {/* Actions - stick to one line */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 sm:self-start whitespace-nowrap">
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
                <NavLinkText>{item.commentCount}</NavLinkText>
          </Link>
          
          {/* Share button */}
          <ShareButton productId={item.id} productName={item.name} />
          </div>
        </div>
        </CardContent>
      </Card>
    </li>
  )
}
