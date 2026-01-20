# Social Sharing & SEO Metadata Analysis
**Date:** January 2025  
**Platform:** Hobbyrider (Product Discovery Platform)

## Executive Summary

This document analyzes Hobbyrider's current social sharing card implementation (Open Graph, Twitter/X cards) and SEO metadata across all page types. It identifies gaps, risks, and opportunities to improve click-through rates and brand consistency when links are shared on social platforms.

---

## 1. Current State Assessment

### ✅ What's Working Well

1. **Basic Metadata Structure**
   - Next.js 16 Metadata API is properly used
   - Dynamic metadata generation for product, category, and user pages
   - Canonical URLs are set for product pages

2. **Product Pages**
   - Full Open Graph and Twitter card metadata
   - Product-specific images (thumbnail or fallback)
   - Proper dimensions declared (1200x630)
   - Product structured data (price, availability, brand)

3. **Base URL Handling**
   - Centralized `getBaseUrl()` function with proper fallbacks
   - Handles Vercel deployment URL correctly

### ❌ Critical Issues & Gaps

#### 1.1 Missing Open Graph Images
- **Homepage** (`app/(main)/page.tsx`): No OG image defined
- **Category Pages** (`app/(main)/category/[slug]/page.tsx`): No OG images
- **User Profile Pages** (`app/(main)/user/[id]/page.tsx`): Images only if user has avatar, no fallback
- **Static Pages** (terms, privacy, FAQ, etc.): No OG images

**Impact:** Generic or broken previews on X, LinkedIn, WhatsApp, Slack

#### 1.2 Homepage Metadata Issues
```typescript
// Current homepage metadata
openGraph: {
  title: "hobbyrider - Discover and share software worth riding",
  description: "A community-driven platform to discover, share, and upvote the best software products.",
  type: "website",
  // ❌ Missing: url, siteName, images
},
twitter: {
  card: "summary_large_image",
  title: "hobbyrider",
  description: "Discover and share software worth riding",
  // ❌ Missing: images (but card type is summary_large_image!)
}
```

**Issues:**
- Twitter card type is `summary_large_image` but no image provided
- Missing OG URL and siteName
- Description inconsistency between OG and Twitter

#### 1.3 Favicon Configuration
- ✅ Favicon properly set at `/icon.svg`
- ⚠️ Missing `apple-touch-icon` for iOS devices
- ⚠️ No favicon fallbacks (different sizes/formats)
- ⚠️ No manifest.json for PWA support

#### 1.4 Product Page Image Issues

**Current Implementation:**
```typescript
const image = product.thumbnail || `${baseUrl}/icon.svg`
```

**Problems:**
1. **SVG Fallback**: `/icon.svg` is SVG format - many platforms don't support SVG for OG images
2. **No Dimension Validation**: Product thumbnails may not be optimal size (1200x630)
3. **External URLs**: Product thumbnails from external sites may be slow/unavailable
4. **No Safe Area**: Images may have important content cropped on different platforms

**Recommended Dimensions by Platform:**
- Facebook/OG: 1200x630px (1.91:1)
- Twitter/X: 1200x675px (16:9) or 1200x1200px (1:1)
- LinkedIn: 1200x627px (1.91:1)
- WhatsApp: 300x157px minimum, prefers 1200x630px

#### 1.5 Category Pages
```typescript
twitter: {
  card: "summary",  // ⚠️ Should be "summary_large_image" for better engagement
  // ❌ No images provided
}
```

#### 1.6 User Profile Pages
```typescript
images: user.image ? [user.image] : undefined,  // ❌ No fallback
```

**Issues:**
- No image if user hasn't uploaded avatar
- User avatars (often small/circular) not optimized for card previews
- Should have Hobbyrider-branded fallback

#### 1.7 Missing Metadata Types

**Not Implemented:**
- No `robots` meta tags (except robots.txt)
- No `author` meta tags
- No structured data (JSON-LD) beyond basic product data
- No article metadata for blog posts (if added in future)
- Missing `og:locale` for internationalization

#### 1.8 Edge Cases Not Handled

1. **Missing Product Images**: Falls back to SVG (not supported by many platforms)
2. **External Image Failures**: No timeout/fallback if external thumbnail is slow
3. **Long Descriptions**: No truncation for optimal display (OG recommends 55-65 chars for title, 155-160 for description)
4. **Special Characters**: May break in some platforms if not properly escaped

---

## 2. Recommendations

### 2.1 Create Default OG Image

**Action:** Create a default Hobbyrider-branded Open Graph image

**Specifications:**
- Dimensions: 1200x630px (OG standard)
- Format: PNG or JPG (NOT SVG)
- Content: Hobbyrider logo + tagline + visual branding
- Safe area: Keep important content in center (1200x630) - platforms crop differently
- Location: `/public/og-default.png` or `/public/og-default.jpg`

**Usage:**
- Homepage
- Static pages (terms, privacy, FAQ)
- Category pages (can be category-specific)
- Fallback for products/users without images

### 2.2 Fix Homepage Metadata

```typescript
export const metadata: Metadata = {
  title: "Discover and share software worth riding",
  description: "hobbyrider - A community-driven platform to discover, share, and upvote the best software products.",
  openGraph: {
    title: "hobbyrider - Discover and share software worth riding",
    description: "A community-driven platform to discover, share, and upvote the best software products.",
    url: baseUrl,  // ✅ Add
    siteName: "hobbyrider",  // ✅ Add
    type: "website",
    images: [
      {
        url: `${baseUrl}/og-default.png`,  // ✅ Add
        width: 1200,
        height: 630,
        alt: "hobbyrider - Discover and share software worth riding",
      },
    ],
    locale: "en_US",  // ✅ Add
  },
  twitter: {
    card: "summary_large_image",
    title: "hobbyrider - Discover and share software worth riding",  // ✅ Match OG
    description: "A community-driven platform to discover, share, and upvote the best software products.",  // ✅ Match OG
    images: [`${baseUrl}/og-default.png`],  // ✅ Add
  },
  alternates: {
    canonical: baseUrl,  // ✅ Add
  },
}
```

### 2.3 Improve Product Page Images

**Current Issue:** SVG fallback not supported by most platforms

**Solution:** Multi-tier fallback system

```typescript
function getProductOGImage(product: Product, baseUrl: string): string {
  // 1. Use product thumbnail if available and valid
  if (product.thumbnail) {
    // TODO: Validate image exists and is accessible
    return product.thumbnail
  }
  
  // 2. Use first product image if available
  if (product.images && product.images.length > 0) {
    return product.images[0].url
  }
  
  // 3. Fallback to PNG/JPG default (NOT SVG)
  return `${baseUrl}/og-product-default.png`
}
```

**Additional Improvements:**
- Validate external image URLs before using
- Use Next.js Image Optimization API to resize/crop to 1200x630
- Consider generating dynamic OG images with product info overlaid

### 2.4 Category Page Enhancements

```typescript
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  
  if (!category) {
    return { title: "Category Not Found" }
  }

  const baseUrl = getBaseUrl()
  const categoryUrl = `${baseUrl}/category/${slug}`
  const productCount = category.products.length

  return {
    title: `${category.name} Products · hobbyrider`,
    description: `Discover ${productCount} ${category.name.toLowerCase()} products on hobbyrider. Find the best ${category.name.toLowerCase()} tools and software.`,
    openGraph: {
      title: `${category.name} Products · hobbyrider`,
      description: `Discover ${productCount} ${category.name.toLowerCase()} products on hobbyrider`,
      url: categoryUrl,
      siteName: "hobbyrider",  // ✅ Add
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-default.png`,  // ✅ Add default or category-specific
          width: 1200,
          height: 630,
          alt: `${category.name} products on hobbyrider`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",  // ✅ Change from "summary"
      title: `${category.name} Products · hobbyrider`,
      description: `Discover ${productCount} ${category.name.toLowerCase()} products`,
      images: [`${baseUrl}/og-default.png`],  // ✅ Add
    },
    alternates: {
      canonical: categoryUrl,  // ✅ Add
    },
  }
}
```

### 2.5 User Profile Page Improvements

```typescript
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  // ... existing code ...
  
  const baseUrl = getBaseUrl()
  const userUrl = `${baseUrl}/user/${user.username || user.id}`
  const displayName = user.name || user.username || "User"
  const description = user.bio || user.headline || `View ${displayName}'s profile and products on hobbyrider`

  // Use user image if available, otherwise branded fallback
  const ogImage = user.image 
    ? [user.image]  // Could enhance this to generate composite image
    : [`${baseUrl}/og-user-default.png`]

  return {
    title: `${displayName} · hobbyrider`,
    description: description,
    openGraph: {
      title: `${displayName} · hobbyrider`,
      description: description,
      url: userUrl,
      siteName: "hobbyrider",  // ✅ Add
      type: "profile",  // ✅ Keep
      images: ogImage.length > 0 ? [
        {
          url: ogImage[0],
          width: 1200,
          height: 630,
          alt: `${displayName} on hobbyrider`,
        }
      ] : undefined,
    },
    twitter: {
      card: "summary_large_image",  // ✅ Change from "summary" if image available
      title: `${displayName} · hobbyrider`,
      description: description,
      images: ogImage,
    },
    alternates: {
      canonical: userUrl,  // ✅ Add
    },
  }
}
```

### 2.6 Create Shared Metadata Utility

**File:** `lib/metadata.ts`

```typescript
import type { Metadata } from "next"

export function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "https://hobbyrider.vercel.app"
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + "..."
}

export function getDefaultOGImage(type: "default" | "product" | "category" | "user" = "default"): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/og-${type}-default.png`
}

export function buildOGImage(url: string, width = 1200, height = 630, alt = ""): Metadata["openGraph"]["images"] {
  return [
    {
      url,
      width,
      height,
      alt,
    },
  ]
}

export function getBaseMetadata(): Partial<Metadata> {
  const baseUrl = getBaseUrl()
  return {
    metadataBase: new URL(baseUrl),
    openGraph: {
      siteName: "hobbyrider",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      creator: "@hobbyrider",  // Add if you have Twitter account
    },
  }
}
```

### 2.7 Enhanced Favicon Setup

**Create multiple favicon sizes:**

```
/public/
  icon.svg (existing - works for modern browsers)
  icon-16x16.png
  icon-32x32.png
  icon-192x192.png
  icon-512x512.png
  apple-touch-icon.png (180x180px)
```

**Update `app/layout.tsx`:**
```typescript
icons: {
  icon: [
    { url: "/icon.svg", type: "image/svg+xml" },
    { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
  ],
  apple: [
    { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  ],
  shortcut: "/icon-32x32.png",
},
```

**Create `public/manifest.json`:**
```json
{
  "name": "hobbyrider",
  "short_name": "hobbyrider",
  "description": "Discover and share software worth riding",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/"
}
```

**Add manifest link in `app/layout.tsx`:**
```typescript
manifest: "/manifest.json",
```

---

## 3. Advanced Recommendations

### 3.1 Dynamic OG Image Generation

**Consider using:** `@vercel/og` (Satori) for generating dynamic OG images

**Benefits:**
- Product pages: Overlay product name, tagline, thumbnail on branded template
- User profiles: Combine avatar + username + product count
- Category pages: Show category name + product count

**Example Implementation:**
```typescript
// app/api/og/[...slug]/route.tsx
import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  // Extract product/user/category ID from slug
  // Fetch data from database
  // Generate image with Satori
  // Return ImageResponse
}
```

**Usage in metadata:**
```typescript
images: [`${baseUrl}/api/og/product/${product.id}`]
```

### 3.2 Image Optimization & Caching

**Strategy:**
1. Cache external thumbnails locally via API route
2. Resize/crop to 1200x630 via Next.js Image API
3. Serve optimized versions from CDN

**Implementation:**
```typescript
// app/api/og-image/[id]/route.ts
// Fetches product thumbnail, validates, resizes, caches, returns optimized image
```

### 3.3 Structured Data (JSON-LD)

**Enhance SEO with Schema.org markup:**

**Product Pages:**
```typescript
// Add to product page metadata.other or separate JSON-LD script
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": product.name,
  "description": product.description,
  "url": product.url,
  "applicationCategory": "WebApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": calculateRating(product.upvotes),
    "reviewCount": product.comments.length
  }
}
```

**Organization:**
```typescript
// Homepage
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "hobbyrider",
  "url": baseUrl,
  "logo": `${baseUrl}/icon-512x512.png`,
  "description": "Discover and share software worth riding"
}
```

### 3.4 A/B Testing Social Cards

**Test different approaches:**
- Product card variations (thumbnail vs. branded overlay)
- Description lengths (short vs. detailed)
- Call-to-action text in images

**Implementation:**
- Use query parameter or feature flag to serve different OG images
- Track click-through rates via UTM parameters

---

## 4. Implementation Priority

### 🔴 Critical (Do Immediately)
1. ✅ Create default OG image (1200x630 PNG)
2. ✅ Fix homepage metadata (add images, URL, siteName)
3. ✅ Replace SVG fallback with PNG fallback for product pages
4. ✅ Add canonical URLs to all pages
5. ✅ Add missing OG images to category and user pages

### 🟡 High Priority (This Week)
6. ✅ Create shared metadata utility functions
7. ✅ Add favicon variants (PNG sizes, apple-touch-icon)
8. ✅ Update Twitter card types (summary → summary_large_image where images exist)
9. ✅ Add OG locale and siteName consistently
10. ✅ Truncate descriptions to optimal lengths

### 🟢 Medium Priority (Next Sprint)
11. ⚪ Implement dynamic OG image generation
12. ⚪ Add structured data (JSON-LD)
13. ⚪ Image optimization pipeline for external thumbnails
14. ⚪ Create PWA manifest

### 🔵 Nice to Have (Future)
15. ⚪ A/B testing framework for social cards
16. ⚪ Analytics tracking for OG image performance
17. ⚪ Category-specific OG images
18. ⚪ Dark mode favicon variants

---

## 5. Testing Checklist

### Manual Testing
- [ ] Test homepage share on X/Twitter
- [ ] Test homepage share on LinkedIn
- [ ] Test homepage share on WhatsApp
- [ ] Test homepage share on Slack
- [ ] Test product page share (with thumbnail)
- [ ] Test product page share (without thumbnail - fallback)
- [ ] Test category page share
- [ ] Test user profile share
- [ ] Verify favicon appears in browser tabs
- [ ] Verify favicon appears in bookmarks
- [ ] Test on iOS (Safari, iMessage)
- [ ] Test on Android (Chrome, WhatsApp)

### Automated Testing
- [ ] Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) to validate OG tags
- [ ] Use [Twitter Card Validator](https://cards-dev.twitter.com/validator) to validate Twitter cards
- [ ] Use [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) to validate LinkedIn previews
- [ ] Run Lighthouse SEO audit
- [ ] Validate structured data with [Google Rich Results Test](https://search.google.com/test/rich-results)

### Tools
- **ogp.xyz** - Quick OG tag validator
- **metatags.io** - Comprehensive metadata preview
- **opengraph.xyz** - Preview generator

---

## 6. Quick Wins (Can Implement Today)

1. **Add default OG image to homepage** (5 minutes)
   - Create `/public/og-default.png` (1200x630)
   - Add to homepage metadata

2. **Fix Twitter card consistency** (10 minutes)
   - Ensure all pages with images use `summary_large_image`
   - Add images array to all Twitter metadata

3. **Add siteName everywhere** (15 minutes)
   - Add `siteName: "hobbyrider"` to all OG metadata

4. **Add canonical URLs** (20 minutes)
   - Add `alternates.canonical` to all pages

5. **Replace SVG fallback** (30 minutes)
   - Create `/public/og-product-default.png`
   - Update product page fallback logic

---

## 7. Platform-Specific Notes

### X (Twitter)
- Requires `summary_large_image` card type for large previews
- Image minimum: 300x157px, recommended: 1200x675px
- Description truncated at ~200 characters
- Supports up to 4 images (but we typically use 1)

### LinkedIn
- Prefers 1200x627px (slightly different from OG standard)
- Supports article type for blog posts
- Profile type for user pages (already implemented ✅)

### WhatsApp
- Uses Open Graph metadata
- Image minimum: 300x157px
- Very image-focused - make sure images are compelling

### Slack
- Uses Open Graph metadata
- Caches aggressively - may need to use [Slack Link Unfurling](https://api.slack.com/reference/messaging/link-unfurling) for updates

### iMessage (Apple Messages)
- Uses Open Graph metadata
- Favors Apple Touch Icon for link previews
- Important to have apple-touch-icon.png

---

## 8. Monitoring & Maintenance

### Track These Metrics
- Click-through rate from social platforms
- Which OG images get the most engagement
- Time to load OG images (external thumbnails may be slow)

### Regular Audits
- Monthly check of Facebook Sharing Debugger for errors
- Quarterly review of social card performance
- Monitor for broken image URLs

---

## Conclusion

Hobbyrider's social sharing infrastructure is **80% complete** but missing critical pieces that significantly impact shareability. The most impactful improvements are:

1. **Default OG images** for all page types
2. **Consistent metadata structure** across all pages
3. **Proper fallbacks** when user-generated content is missing
4. **Image optimization** for better load times and compatibility

Implementing the Critical and High Priority items will ensure every Hobbyrider link shared on social platforms looks professional, trustworthy, and clickable.

---

**Next Steps:**
1. Review this document with design team for OG image creation
2. Prioritize implementation items
3. Assign implementation tasks
4. Set up monitoring/analytics for social traffic
