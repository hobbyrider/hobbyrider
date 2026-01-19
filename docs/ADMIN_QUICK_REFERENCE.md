# Admin Quick Reference

## Seed Products Tab

### Bulk Seed Products
1. Go to `/admin` → "Seed Products" tab
2. Paste URLs (one per line) in the textarea
3. Select categories (optional)
4. Adjust "Max Words" if needed (default: 2)
5. Click "Seed X Product(s)"

### Fix Existing Products

#### Fix Low-Quality Logos
Finds and replaces low-quality logos (.ico, small favicons, screenshots) with high-quality logos (SVG, WebP, large PNGs).

```bash
# Fix all seeded products with low-quality logos
npx tsx scripts/fix-product-logos.ts

# Fix specific product
npx tsx scripts/fix-product-logos.ts https://example.com

# Force re-extract all logos (recommended if logos look weird/low quality)
npx tsx scripts/fix-product-logos.ts --force
```

#### Fix Poor Names & Taglines
Fixes names with trailing words ("PostHog We" → "PostHog"), domain extensions ("forgetbill.com" → "Forgetbill"), and taglines that are URLs or redundant.

```bash
# Fix all seeded products
npx tsx scripts/fix-product-names-taglines.ts

# Fix specific product
npx tsx scripts/fix-product-names-taglines.ts https://example.com
```

#### Fix Everything (Complete Refresh)
To fix logos, names, and taglines for a specific product:

```bash
# Fix logos
npx tsx scripts/fix-product-logos.ts https://example.com

# Fix names/taglines
npx tsx scripts/fix-product-names-taglines.ts https://example.com
```

## Quality Rules

All new products automatically follow these rules:

### Product Names
- ✅ Brand name only (max 2 words by default)
- ✅ No trailing words: "We", "The", "Home", "Official"
- ✅ No domain extensions: `.com`, `.io`, etc.
- ✅ No punctuation

### Taglines
- ✅ Max 70 characters
- ✅ No URLs/domains
- ✅ No redundancy (doesn't start with product name)
- ✅ Concise value proposition

### Logos
- ✅ Prioritizes: SVG > WebP > Large PNG > Small PNG > ICO
- ✅ Prefers larger sizes (512x512, 256x256, 192x192)

See `docs/PRODUCT_SEEDING_QUALITY_RULES.md` for complete rules and examples.
