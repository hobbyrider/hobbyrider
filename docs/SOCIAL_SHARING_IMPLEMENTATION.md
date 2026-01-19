# Social Sharing Implementation Checklist

**Quick Reference:** Step-by-step implementation guide based on [Social Sharing Analysis](./SOCIAL_SHARING_ANALYSIS.md)

---

## Phase 1: Critical Fixes (Do First)

### ✅ Task 1: Create Default OG Images

**Required Images:**
- `/public/og-default.png` - Homepage, static pages (1200x630px)
- `/public/og-product-default.png` - Product fallback (1200x630px)
- `/public/og-category-default.png` - Category pages (1200x630px, optional)
- `/public/og-user-default.png` - User profile fallback (1200x630px, optional - can reuse default)

**Design Specifications:**
- **Dimensions:** 1200x630px (OG standard ratio 1.91:1)
- **Format:** PNG (with transparency) or JPG
- **Safe Area:** Keep important content within 1200x630px center
- **Content:** Hobbyrider logo + tagline "Discover and share software worth riding" + visual branding
- **Fonts:** Use bold, readable fonts (at least 24px for main text)
- **Colors:** Match Hobbyrider brand colors
- **Text:** Keep to 2-3 lines max

**Action Items:**
- [ ] Design OG images in Figma/Sketch
- [ ] Export as PNG at 1200x630px
- [ ] Add to `/public/` directory
- [ ] Test on [ogp.xyz](https://ogp.xyz) to verify

---

### ✅ Task 2: Update Root Layout with Shared Utilities

**File:** `app/layout.tsx`

```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/app/components/auth-provider"
import { getBaseUrl, getBaseMetadata } from "@/lib/metadata"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  ...getBaseMetadata(),  // ✅ Add shared base metadata
  title: {
    default: "hobbyrider",
    template: "%s · hobbyrider",
  },
  description: "Discover and share software worth riding.",
  icons: {
    icon: "/icon.svg",
    // TODO: Add favicon variants (see Task 7)
  },
}
```

**Action Items:**
- [ ] Import `getBaseMetadata` from `lib/metadata`
- [ ] Spread base metadata into root metadata
- [ ] Test that metadata still works correctly

---

### ✅ Task 3: Fix Homepage Metadata

**File:** `app/(main)/page.tsx`

**Before:**
```typescript
export const metadata: Metadata = {
  title: "Discover and share software worth riding",
  description: "hobbyrider - A community-driven platform to discover, share, and upvote the best software products.",
  openGraph: {
    title: "hobbyrider - Discover and share software worth riding",
    description: "A community-driven platform to discover, share, and upvote the best software products.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "hobbyrider",
    description: "Discover and share software worth riding",
  },
}
```

**After:**
```typescript
import { getBaseUrl, buildOpenGraphMetadata, buildTwitterMetadata } from "@/lib/metadata"

const baseUrl = getBaseUrl()

export const metadata: Metadata = {
  title: "Discover and share software worth riding",
  description: "hobbyrider - A community-driven platform to discover, share, and upvote the best software products. Find tools that are worth riding.",
  openGraph: {
    ...buildOpenGraphMetadata({
      title: "hobbyrider - Discover and share software worth riding",
      description: "A community-driven platform to discover, share, and upvote the best software products.",
      url: baseUrl,
      image: `${baseUrl}/og-default.png`,
    }),
  },
  twitter: buildTwitterMetadata({
    title: "hobbyrider - Discover and share software worth riding",
    description: "A community-driven platform to discover, share, and upvote the best software products.",
    image: `${baseUrl}/og-default.png`,
  }),
  alternates: {
    canonical: baseUrl,
  },
}
```

**Action Items:**
- [ ] Import metadata utilities
- [ ] Add OG image to homepage
- [ ] Add canonical URL
- [ ] Ensure Twitter title matches OG title
- [ ] Test share preview on [ogp.xyz](https://ogp.xyz)

---

### ✅ Task 4: Fix Product Page Metadata

**File:** `app/(main)/product/[id]/page.tsx`

**Key Changes:**
1. Replace SVG fallback with PNG
2. Use shared utility functions
3. Ensure proper image dimensions

**Before:**
```typescript
const image = product.thumbnail || `${baseUrl}/icon.svg`
```

**After:**
```typescript
import { getProductOGImage, buildOpenGraphMetadata, buildTwitterMetadata, truncateText } from "@/lib/metadata"

// In generateMetadata function:
const ogImage = getProductOGImage(product.thumbnail, product.images)
const description = truncateText(product.description || product.tagline, 160)

return {
  title: `${product.name} · hobbyrider`,
  description: description,
  openGraph: {
    ...buildOpenGraphMetadata({
      title: product.name,
      description: description,
      url: productUrl,
      image: ogImage,
      type: "website",
    }),
  },
  twitter: buildTwitterMetadata({
    title: product.name,
    description: description,
    image: ogImage,
  }),
  alternates: {
    canonical: productUrl,
  },
  // ... existing other metadata
}
```

**Action Items:**
- [ ] Import `getProductOGImage` and other utilities
- [ ] Replace SVG fallback with PNG fallback
- [ ] Use shared metadata builders
- [ ] Test product page with thumbnail
- [ ] Test product page without thumbnail (fallback)
- [ ] Verify on [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

---

### ✅ Task 5: Fix Category Page Metadata

**File:** `app/(main)/category/[slug]/page.tsx`

**Key Changes:**
1. Add OG image
2. Change Twitter card to `summary_large_image`
3. Add canonical URL
4. Add siteName

**After:**
```typescript
import { getBaseUrl, buildOpenGraphMetadata, buildTwitterMetadata } from "@/lib/metadata"

const baseUrl = getBaseUrl()
const categoryUrl = `${baseUrl}/category/${slug}`
const productCount = category.products.length

return {
  title: `${category.name} Products · hobbyrider`,
  description: `Discover ${productCount} ${category.name.toLowerCase()} products on hobbyrider. Find the best ${category.name.toLowerCase()} tools and software.`,
  openGraph: {
    ...buildOpenGraphMetadata({
      title: `${category.name} Products · hobbyrider`,
      description: `Discover ${productCount} ${category.name.toLowerCase()} products on hobbyrider`,
      url: categoryUrl,
      image: `${baseUrl}/og-default.png`, // Or category-specific if created
    }),
  },
  twitter: buildTwitterMetadata({
    title: `${category.name} Products · hobbyrider`,
    description: `Discover ${productCount} ${category.name.toLowerCase()} products`,
    image: `${baseUrl}/og-default.png`,
    cardType: "summary_large_image", // ✅ Changed from "summary"
  }),
  alternates: {
    canonical: categoryUrl,
  },
}
```

**Action Items:**
- [ ] Add OG image
- [ ] Change Twitter card type
- [ ] Add canonical URL
- [ ] Test category page share preview

---

### ✅ Task 6: Fix User Profile Page Metadata

**File:** `app/(main)/user/[id]/page.tsx`

**Key Changes:**
1. Add fallback image
2. Use shared utilities
3. Add canonical URL

**After:**
```typescript
import { getUserOGImage, buildOpenGraphMetadata, buildTwitterMetadata } from "@/lib/metadata"

const ogImage = getUserOGImage(user.image)
const displayName = user.name || user.username || "User"
const description = user.bio || user.headline || `View ${displayName}'s profile and products on hobbyrider`

return {
  title: `${displayName} · hobbyrider`,
  description: description,
  openGraph: {
    ...buildOpenGraphMetadata({
      title: `${displayName} · hobbyrider`,
      description: description,
      url: userUrl,
      image: ogImage,
      type: "profile",
    }),
  },
  twitter: buildTwitterMetadata({
    title: `${displayName} · hobbyrider`,
    description: description,
    image: ogImage,
    cardType: "summary_large_image", // ✅ Changed from "summary"
  }),
  alternates: {
    canonical: userUrl,
  },
}
```

**Action Items:**
- [ ] Add fallback image logic
- [ ] Use shared utilities
- [ ] Change Twitter card type
- [ ] Test user page with avatar
- [ ] Test user page without avatar (fallback)

---

## Phase 2: High Priority (This Week)

### ✅ Task 7: Enhanced Favicon Setup

**Create Favicon Files:**
- `/public/icon-16x16.png`
- `/public/icon-32x32.png`
- `/public/icon-192x192.png`
- `/public/icon-512x512.png`
- `/public/apple-touch-icon.png` (180x180px)

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

**Add manifest to `app/layout.tsx`:**
```typescript
export const metadata: Metadata = {
  // ... existing metadata
  manifest: "/manifest.json",
}
```

**Action Items:**
- [ ] Generate favicon files from SVG (use tool like [realfavicongenerator.net](https://realfavicongenerator.net/))
- [ ] Add favicon variants to metadata
- [ ] Create manifest.json
- [ ] Add manifest link
- [ ] Test favicons in browser tabs and bookmarks
- [ ] Test on iOS (Safari, iMessage) - verify apple-touch-icon

---

### ✅ Task 8: Add Canonical URLs to All Pages

**Pages to Update:**
- [x] Homepage - Already done in Task 3
- [x] Product pages - Already done in Task 4
- [x] Category pages - Already done in Task 5
- [x] User pages - Already done in Task 6
- [ ] Static pages (terms, privacy, FAQ, etc.)

**Example for static pages:**
```typescript
import { getBaseUrl } from "@/lib/metadata"

const baseUrl = getBaseUrl()

export const metadata: Metadata = {
  // ... existing metadata
  alternates: {
    canonical: `${baseUrl}/terms`, // or /privacy, /faq, etc.
  },
}
```

**Action Items:**
- [ ] Add canonical URLs to all static pages
- [ ] Verify no duplicate canonical URLs
- [ ] Test with [Google Search Console](https://search.google.com/search-console)

---

## Phase 3: Testing & Validation

### ✅ Task 9: Comprehensive Testing

**Manual Testing Checklist:**
- [ ] Test homepage share on X/Twitter
- [ ] Test homepage share on LinkedIn
- [ ] Test homepage share on WhatsApp
- [ ] Test homepage share on Slack
- [ ] Test homepage share on iMessage (iOS)
- [ ] Test product page share (with thumbnail)
- [ ] Test product page share (without thumbnail - fallback)
- [ ] Test category page share
- [ ] Test user profile share (with avatar)
- [ ] Test user profile share (without avatar - fallback)
- [ ] Verify favicon appears in browser tabs
- [ ] Verify favicon appears in bookmarks
- [ ] Verify apple-touch-icon on iOS

**Automated Testing:**
- [ ] Validate with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Validate with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Validate with [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [ ] Validate with [ogp.xyz](https://ogp.xyz)
- [ ] Run Lighthouse SEO audit (should score 100)
- [ ] Validate structured data with [Google Rich Results Test](https://search.google.com/test/rich-results)

**Action Items:**
- [ ] Create test checklist spreadsheet
- [ ] Document any issues found
- [ ] Fix issues before deployment
- [ ] Re-test after fixes

---

## Phase 4: Future Enhancements (Optional)

### ⚪ Task 10: Dynamic OG Image Generation

**Consider:** Using `@vercel/og` (Satori) for dynamic images

**Benefits:**
- Product-specific cards with product info overlaid
- User profile cards with stats
- Category cards with product count

**Implementation:**
- Create `app/api/og/[...slug]/route.tsx`
- Generate images on-the-fly
- Cache generated images

**Action Items:**
- [ ] Research `@vercel/og` documentation
- [ ] Create proof-of-concept
- [ ] Test performance impact
- [ ] Decide if worth implementing

---

### ⚪ Task 11: Structured Data (JSON-LD)

**Add Schema.org markup for:**
- SoftwareApplication (product pages)
- Organization (homepage)
- Person (user profiles)
- WebSite (site-wide)

**Action Items:**
- [ ] Research Schema.org vocabulary
- [ ] Create JSON-LD components
- [ ] Add to relevant pages
- [ ] Validate with Google Rich Results Test

---

## Quick Reference: Testing URLs

After implementing changes, test these URLs:

**Homepage:**
- https://ogp.xyz/?url=https://hobbyrider.vercel.app

**Product Page:**
- https://ogp.xyz/?url=https://hobbyrider.vercel.app/product/[product-id]

**Category Page:**
- https://ogp.xyz/?url=https://hobbyrider.vercel.app/category/[category-slug]

**User Profile:**
- https://ogp.xyz/?url=https://hobbyrider.vercel.app/user/[username]

**Platform-Specific:**
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

---

## Success Criteria

After implementing all Critical and High Priority tasks:

✅ Every page has an OG image (no broken previews)  
✅ Twitter cards use correct type and have images  
✅ All pages have canonical URLs  
✅ Favicons appear correctly in all browsers/devices  
✅ Metadata is consistent across all page types  
✅ Social shares look professional and on-brand  

---

**Next Steps:**
1. Review this checklist with team
2. Assign tasks
3. Start with Phase 1 (Critical)
4. Test after each phase
5. Deploy incrementally
