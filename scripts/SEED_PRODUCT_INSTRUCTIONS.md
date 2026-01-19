# Seed Product Workflow - Updated Guide

## Overview

You now have **two ways** to seed products into Hobbyrider:

1. **Admin UI (Recommended)** - Best for regular use, visual feedback, batch operations
2. **CLI Script** - Best for bulk automation, one-time imports, or command-line workflows

---

## Option A: Admin UI (Recommended)

### Access
Navigate to: `/admin/seed-products` (or click "Seed Products →" from the Moderation page)

### Features
- ✅ Bulk URL input (paste multiple URLs, one per line)
- ✅ Visual feedback with results table
- ✅ Category selection via clickable buttons
- ✅ Configurable max words for product names
- ✅ Shows success/failure for each URL
- ✅ Direct links to created products
- ✅ Mobile-responsive interface

### Usage
1. Go to `/admin/seed-products`
2. Paste product URLs (one per line) in the textarea
3. (Optional) Select categories by clicking category buttons
4. (Optional) Adjust "Max Words" if needed (default: 2)
5. Click "Seed X Product(s)" button
6. Review results table for successes and failures

### Example URLs Input
```
https://linear.app
https://tally.so
https://notion.so
https://figma.com
```

---

## Option B: CLI Script

### Single Product

```bash
# Basic usage
npx tsx scripts/seed-product.ts https://example.com

# With categories
npx tsx scripts/seed-product.ts https://example.com saas productivity

# With custom max words
npx tsx scripts/seed-product.ts https://example.com --max-words=3
```

### Bulk from File (NEW!)

Create a file `urls.txt` with one URL per line:
```
https://linear.app
https://tally.so
https://notion.so
https://figma.com
```

Then run:
```bash
# Basic bulk import
npx tsx scripts/seed-product.ts --file urls.txt

# With categories (applied to all products)
npx tsx scripts/seed-product.ts --file urls.txt saas productivity

# With custom max words
npx tsx scripts/seed-product.ts --file urls.txt --max-words=3
```

### CLI Features
- ✅ Fast batch processing
- ✅ Good for automation/scripts
- ✅ Progress shown in console
- ✅ Summary of successes/failures

---

## Comparison

| Feature | Admin UI | CLI Script |
|---------|----------|------------|
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Bulk Operations** | ✅ Yes | ✅ Yes |
| **Visual Feedback** | ✅ Yes (table) | ⚠️ Console only |
| **Category Selection** | ✅ Click buttons | ⚠️ Type slugs |
| **Error Handling** | ✅ Per-URL errors | ✅ Per-URL errors |
| **Automation** | ❌ Manual | ✅ Scriptable |
| **Mobile Friendly** | ✅ Yes | ❌ Terminal only |

---

## Recommendations

### Use Admin UI when:
- Seeding 1-50 products regularly
- Need visual feedback
- Working in browser
- Want easy category selection
- Prefer point-and-click interface

### Use CLI Script when:
- Seeding 50+ products at once
- Automating in scripts/cron jobs
- Working in terminal
- Need to integrate with other tools
- Prefer command-line workflow

---

## Quality Rules (Established Standards)

### Product Names
- ✅ **Clean brand names**: "PostHog", "Dub", "Tally" (not "PostHog We", "Dub The")
- ✅ **No domain extensions**: Removes `.com`, `.io`, etc.
- ✅ **No trailing words**: Removes "We", "The", "Home", "Official", etc.
- ✅ **Max 2 words**: By default (can override with `--max-words=N`)
- ✅ **No punctuation**: Only letters, numbers, and spaces
- ✅ **Brand extraction**: Extracts actual brand from title, not full title

### Taglines
- ✅ **No URLs/domains**: Rejects taglines that are URLs (e.g., "forgetbill.com")
- ✅ **No redundancy**: Removes product name from start of tagline
- ✅ **Concise**: Max 70 characters, first sentence only
- ✅ **Value proposition**: Should describe what the product does
- ✅ **No truncation**: Avoids incomplete words

### Logos
- ✅ **Prioritizes high-quality**: SVG > WebP > PNG (large) > PNG (small) > ICO
- ✅ **Scalable formats**: Prefers SVG (vector) and WebP (compressed)
- ✅ **Large sizes**: Prefers 512x512, 256x256, 192x192 over smaller icons
- ✅ **Falls back gracefully**: Uses best available if high-quality not found

## What Happens When Seeding

For each URL, the system:
1. ✅ Validates the URL (must be HTTPS)
2. ✅ Checks if product already exists
3. ✅ Extracts metadata using quality rules
4. ✅ Cleans product name (removes trailing words, domains, limits to N words)
5. ✅ Cleans tagline (removes URLs, redundancy, truncation)
6. ✅ Finds high-quality logo (SVG/WebP prioritized)
7. ✅ Finds screenshots (OG images, Twitter cards)
8. ✅ Uploads images to Vercel Blob (if token configured)
9. ✅ Creates product with `ownershipStatus: "seeded"`
10. ✅ Assigns categories (if provided)
11. ✅ Sets `seededBy` to your admin user ID

---

## Requirements

### Admin User
You must have an admin user. If you don't have one:
```bash
npx tsx scripts/set-admin.ts <your-email>
```

### Categories (Optional)
Categories are automatically available. Available slugs:
- `saas`, `mobile-app`, `developer-tools`, `ai-tools`, `design-tools`
- `productivity`, `marketing`, `ecommerce`, `education`, `entertainment`

### Environment Variables
- `DATABASE_URL` - Required
- `BLOB_READ_WRITE_TOKEN` - Optional but recommended (for image uploads)

---

## Troubleshooting

### "Only admins can seed products"
- Ensure you're logged in as an admin
- Check: `npx tsx scripts/set-admin.ts <your-email>`

### "Product with URL already exists"
- The product is already in the database
- Edit it via the admin panel or product page

### "Failed to extract metadata"
- Website might be down or blocking requests
- Try the URL in a browser first
- Some sites require JavaScript (basic parsing doesn't support this)

### Images not uploading
- Check `BLOB_READ_WRITE_TOKEN` is set
- Images will fallback to original URLs if Blob is unavailable

---

## Fixing Existing Products

### Fix Low-Quality Logos

```bash
# Fix all seeded products with low-quality logos (.ico, small favicons)
npx tsx scripts/fix-product-logos.ts

# Fix a specific product
npx tsx scripts/fix-product-logos.ts https://example.com
```

### Fix Poor Names/Taglines

```bash
# Fix all seeded products with poor names/taglines
npx tsx scripts/fix-product-names-taglines.ts

# Fix a specific product
npx tsx scripts/fix-product-names-taglines.ts https://example.com
```

These scripts will:
- Find products with low-quality logos (`.ico`, small favicons)
- Find products with poor names (domain-like, trailing "We"/"The", etc.)
- Find products with poor taglines (URLs, too long, redundant)
- Extract better metadata using quality rules and update products

## Best Practices

1. **Start Small**: Test with 1-2 URLs first
2. **Review Results**: Check the created products for accuracy
3. **Category Selection**: Assign appropriate categories for better discoverability
4. **Bulk Processing**: For 50+ products, use CLI script or batch in Admin UI
5. **Error Handling**: Review failed URLs and retry individually if needed
6. **Quality Check**: Run fix scripts periodically to improve existing products
7. **Consistency**: All new products automatically follow quality rules

---

**Last Updated**: January 2025  
**Version**: 2.0 (Added Admin UI and bulk file support)
