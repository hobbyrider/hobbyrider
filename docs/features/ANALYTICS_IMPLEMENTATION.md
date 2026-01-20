# Basic Analytics Implementation

## Overview

A comprehensive analytics system has been implemented to track product views, identify popular content, and provide engagement metrics.

## Features Implemented

### 1. Product View Tracking
- **Database Field:** `viewCount` (Int, default: 0) in Software model
- **Tracking:** Automatic view counting when users visit product pages
- **Performance:** Asynchronous tracking (doesn't block page load)
- **Location:** `app/actions/analytics.ts` → `trackProductView()`

### 2. Analytics Functions

#### `trackProductView(productId: string)`
- Increments view count for a product
- Updates `lastViewedAt` timestamp
- Runs asynchronously to avoid blocking page renders

#### `getPopularProducts(limit: number)`
- Returns products sorted by view count, then upvotes, then creation date
- Useful for "Most Popular" sections

#### `getTrendingProducts(limit: number)`
- Calculates trending score: `(views × 0.3) + (upvotes × 0.5) + (comments × 0.2)`
- Applies 2x multiplier for products created in last 7 days
- Returns products sorted by trending score

#### `getProductAnalytics(productId: string)`
- Returns detailed stats for a single product:
  - Total views
  - Upvotes
  - Comments
  - Last viewed timestamp
  - Engagement rate (upvotes + comments / views)

#### `getPlatformAnalytics()`
- Returns overall platform statistics:
  - Total products
  - Total views
  - Total upvotes
  - Total comments
  - Total users
  - Average views per product
  - Average upvotes per product
  - Top 5 popular products

### 3. UI Display

**Product Page Sidebar:**
- Stats section showing:
  - Views count
  - Upvotes count
  - Comments count

## Database Schema Changes

```prisma
model Software {
  // ... existing fields
  viewCount   Int       @default(0)
  lastViewedAt DateTime?
  
  @@index([viewCount, createdAt])
}
```

## Usage Examples

### Track a Product View
```typescript
import { trackProductView } from "@/app/actions/analytics"

// In product page component
trackProductView(productId).catch(console.error)
```

### Get Popular Products
```typescript
import { getPopularProducts } from "@/app/actions/analytics"

const popular = await getPopularProducts(10)
```

### Get Trending Products
```typescript
import { getTrendingProducts } from "@/app/actions/analytics"

const trending = await getTrendingProducts(10)
```

### Get Product Analytics
```typescript
import { getProductAnalytics } from "@/app/actions/analytics"

const stats = await getProductAnalytics(productId)
// Returns: { views, upvotes, comments, lastViewedAt, engagementRate }
```

### Get Platform Analytics
```typescript
import { getPlatformAnalytics } from "@/app/actions/analytics"

const platformStats = await getPlatformAnalytics()
// Returns: { totalProducts, totalViews, totalUpvotes, ... }
```

## Performance Considerations

- **Asynchronous Tracking:** View tracking doesn't block page rendering
- **Indexed Queries:** Database indexes on `viewCount` for fast sorting
- **Error Handling:** Analytics failures don't break the app
- **Efficient Queries:** Uses `select` statements to minimize data transfer

## Future Enhancements (Optional)

1. **User-specific analytics** - Track which users viewed what
2. **Time-based analytics** - Views per day/week/month
3. **Referral tracking** - Where users came from
4. **Analytics dashboard** - Admin UI for viewing all stats
5. **Export functionality** - CSV/JSON export of analytics data

## Files Modified

- `prisma/schema.prisma` - Added `viewCount` and `lastViewedAt` fields
- `app/actions/analytics.ts` - New analytics functions
- `app/(main)/product/[id]/page.tsx` - View tracking and stats display
- `app/(main)/page.tsx` - Added `viewCount` to SoftwareItem type
