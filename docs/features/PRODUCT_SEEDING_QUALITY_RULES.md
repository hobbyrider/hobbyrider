# Product Seeding Quality Rules

## Overview

These quality rules ensure consistent, high-quality product listings when seeding products into Hobbyrider. All rules are enforced automatically during the seeding process.

---

## Product Name Rules

### ✅ What We DO

1. **Extract Brand Name**
   - Extract actual brand name, not full page title
   - Example: "PostHog - We make dev tools" → "PostHog"

2. **Remove Trailing Generic Words**
   - Removes: "We", "The", "Our", "Home", "Official", "Welcome", "Site", "Website", etc.
   - Example: "Dub The modern platform" → "Dub"

3. **Remove Domain Extensions**
   - Removes: `.com`, `.io`, `.co`, `.net`, `.org`, etc.
   - Example: "forgetbill.com" → "Forgetbill"
   - Example: "forgetbill com" → "Forgetbill"

4. **Extract from Title Pattern**
   - Extracts brand from "Brand - Description" or "Brand | Description"
   - Example: "Tally | Free Online Form Builder" → "Tally"

5. **Limit to 2 Words Maximum** (default)
   - Example: "Free Online Form Builder" → "Tally" (single brand name)
   - Can override with `--max-words=N` if needed

6. **Remove Punctuation**
   - Only letters, numbers, and spaces
   - Example: "Product, Inc." → "Product Inc"

### ❌ What We AVOID

1. **Domain-like Names**
   - ❌ "example.com"
   - ❌ "forgetbill com"
   - ✅ "Forgetbill"

2. **Trailing Generic Words**
   - ❌ "PostHog We"
   - ❌ "Dub The"
   - ✅ "PostHog"
   - ✅ "Dub"

3. **Full Page Titles**
   - ❌ "Free Online Form Builder | Tally"
   - ✅ "Tally"

4. **Too Many Words**
   - ❌ "The Best Project Management Tool Ever"
   - ✅ "Best Tool" (2 words max)

---

## Tagline Rules

### ✅ What We DO

1. **Extract Value Proposition**
   - First sentence or clause
   - Max 70 characters
   - Example: "The simplest way to create forms"

2. **Remove Redundancy**
   - Removes product name from start of tagline
   - Example: "PostHog - We make dev tools" → "Dev tools for product engineers"

3. **Reject URLs/Domains**
   - ❌ "forgetbill.com"
   - ✅ "Never forget a bill again"

4. **Remove Generic Prefixes**
   - Removes: "We make", "We are", "Our product", "This is", etc.
   - Example: "We make the best tool" → "The best tool"

5. **Avoid Truncation**
   - Cuts at word boundaries when possible
   - Avoids incomplete words

### ❌ What We AVOID

1. **URLs/Domains**
   - ❌ "forgetbill.com"
   - ❌ "www.example.com"
   - ✅ "Never forget a bill again"

2. **Redundant Names**
   - ❌ "PostHog - We make dev tools" (starts with product name)
   - ✅ "Dev tools for product engineers"

3. **Too Long**
   - ❌ "A simple, flexible project management tool for organizing your boar..." (truncated)
   - ✅ "A simple, flexible project management tool"

4. **Incomplete Sentences**
   - ❌ "The simplest way to create forms and..." (truncated mid-word)
   - ✅ "The simplest way to create forms"

---

## Logo Quality Rules

### ✅ Priority Order (Highest to Lowest)

1. **SVG Logos** (Priority 10)
   - Vector format, scalable, best quality
   - Examples: `/logo.svg`, rel="logo" pointing to SVG

2. **WebP Logos** (Priority 9)
   - Compressed format, high quality
   - Examples: `/logo.webp`, rel="icon" pointing to WebP

3. **Apple Touch Icon** (Priority 7-8)
   - High-quality PNGs (usually 180x180 or 512x512)
   - Example: rel="apple-touch-icon"

4. **Large Sized Icons** (Priority 5-6)
   - Prefers 512x512, 256x256, 192x192
   - Avoids 16x16, 32x32 (too small)

5. **OG Image** (Priority 4-8)
   - Only if SVG/WebP format
   - Lower priority (often screenshots, not logos)

6. **Standard Favicon** (Priority 3-7)
   - Lower priority unless SVG/WebP

7. **Common Logo Paths** (Priority 6-9)
   - Tries: `/logo.svg`, `/logo.webp`, `/logo.png`, `/favicon.svg`, `/favicon.webp`

### ❌ What We AVOID

1. **Small Favicons**
   - ❌ 16x16, 32x32 icons (pixelated when scaled)
   - ✅ 192x192+ or SVG/WebP

2. **ICO Files**
   - ❌ `/favicon.ico` (old format, low quality)
   - ✅ SVG or WebP preferred

3. **Screenshots as Logos**
   - ❌ OG images that are clearly product screenshots
   - ✅ Actual brand logos

---

## Validation Rules

### Product Name Validation

A name is considered poor quality if:
- Contains domain extension (`.com`, `.io`, etc.)
- Ends with generic word ("We", "The", "Home", "Official")
- Has more than 3 words (should be 2 max by default)
- Is too short (< 2 characters)

### Tagline Validation

A tagline is considered poor quality if:
- Is a URL/domain (starts with `http://`, `www.`, or domain pattern)
- Starts with product name (redundant)
- Is too short (< 10 characters)
- Is too long (> 70 characters)
- Appears truncated (ends with `...` or short word)

---

## Examples

### Good Examples ✅

| Title/Description | Name | Tagline |
|------------------|------|---------|
| "Tally \| Free Online Form Builder" | Tally | The simplest way to create forms |
| "PostHog - We make dev tools for product engineers" | PostHog | Dev tools for product engineers |
| "Dub is the modern link attribution platform" | Dub | The modern link attribution platform |
| "forgetbill.com - Never forget a bill again" | Forgetbill | Never forget a bill again |

### Bad Examples ❌ → Fixed

| Before | After |
|--------|-------|
| "PostHog We" | "PostHog" |
| "Dub The" | "Dub" |
| "forgetbill com" | "Forgetbill" |
| "forgetbill.com" (tagline) | "Never forget a bill again" |
| "PostHog - We make dev tools" (tagline) | "Dev tools for product engineers" |

---

## Fixing Existing Products

### Fix All Products

```bash
# Fix logos
npx tsx scripts/fix-product-logos.ts

# Fix names/taglines
npx tsx scripts/fix-product-names-taglines.ts
```

### Fix Specific Product

```bash
# Fix logos for one product
npx tsx scripts/fix-product-logos.ts https://example.com

# Fix names/taglines for one product
npx tsx scripts/fix-product-names-taglines.ts https://example.com
```

---

## Implementation

All quality rules are implemented in:
- `lib/product-extraction.ts` - Core extraction utilities
- `app/actions/seed.ts` - Server action (used by Admin UI)
- `scripts/seed-product.ts` - CLI script

Both the Admin UI and CLI script use the same quality rules, ensuring consistency.

---

**Last Updated**: January 2025
