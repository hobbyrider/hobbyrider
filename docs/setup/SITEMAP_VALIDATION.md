# Sitemap Validation Guide

This document explains how to validate that the sitemap is Google-compliant.

## Quick Validation

### Using curl

```bash
# Test local development
curl -I http://localhost:3000/sitemap.xml

# Test production
curl -I https://hobbyrider.io/sitemap.xml

# View full sitemap content
curl https://hobbyrider.io/sitemap.xml
```

### Using the validation script

```bash
# Test local development
./scripts/validate-sitemap.sh http://localhost:3000

# Test production
./scripts/validate-sitemap.sh https://hobbyrider.io
```

## Expected Response Headers

```
HTTP/1.1 200 OK
Content-Type: application/xml; charset=utf-8
```

## Expected XML Structure

The sitemap should follow this format (Google-compliant):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hobbyrider.io</loc>
    <lastmod>2024-01-15</lastmod>
  </url>
  <url>
    <loc>https://hobbyrider.io/products/example-product-abc123</loc>
    <lastmod>2024-01-10</lastmod>
  </url>
  <url>
    <loc>https://hobbyrider.io/blog/my-blog-post</loc>
    <lastmod>2024-01-12</lastmod>
  </url>
  <!-- ... more URLs ... -->
</urlset>
```

## Key Requirements

✅ **Required fields:**
- `<loc>` - Full URL (required)
- `<lastmod>` - Date in YYYY-MM-DD format (optional but recommended)

❌ **Deprecated fields (must NOT appear):**
- `<changefreq>` - Removed (deprecated by Google)
- `<priority>` - Removed (deprecated by Google)

## Validation Checklist

- [ ] HTTP 200 status code
- [ ] Content-Type: `application/xml` or `text/xml`
- [ ] Valid XML structure with proper namespace
- [ ] All URLs have `<loc>` tags
- [ ] All URLs have `<lastmod>` in YYYY-MM-DD format
- [ ] No `<changefreq>` tags anywhere
- [ ] No `<priority>` tags anywhere
- [ ] No extra whitespace before XML declaration

## Testing in Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (hobbyrider.io)
3. Navigate to **Sitemaps** in the left sidebar
4. Enter `sitemap.xml` in the "Add a new sitemap" field
5. Click **Submit**
6. Wait a few minutes and check the status
7. Should show: "Success" with discovered pages > 0

## Troubleshooting

### "Sitemap could not be read"

**Possible causes:**
- Invalid XML structure
- Missing or incorrect namespace
- Deprecated fields present (`<changefreq>`, `<priority>`)
- Invalid date format in `<lastmod>` (must be YYYY-MM-DD)
- Extra whitespace before XML declaration

**Solution:**
- Run the validation script: `./scripts/validate-sitemap.sh https://hobbyrider.io`
- Check the XML output manually
- Ensure all deprecated fields are removed
- Verify date format is YYYY-MM-DD (not ISO 8601 with time)

### "Discovered pages: 0"

**Possible causes:**
- Sitemap is empty
- URLs are invalid or inaccessible
- Robots.txt is blocking crawlers

**Solution:**
- Verify sitemap contains URLs: `curl https://hobbyrider.io/sitemap.xml | grep -c "<loc>"`
- Check robots.txt: `curl https://hobbyrider.io/robots.txt`
- Ensure URLs are accessible (not 404 or blocked)

## Example Valid Sitemap Entry

```xml
<url>
  <loc>https://hobbyrider.io/products/my-awesome-product-abc123</loc>
  <lastmod>2024-01-15</lastmod>
</url>
```

## Example Invalid Sitemap Entry (DO NOT USE)

```xml
<url>
  <loc>https://hobbyrider.io/products/my-awesome-product-abc123</loc>
  <lastmod>2024-01-15T10:30:00.000Z</lastmod>  <!-- ❌ Wrong: includes time -->
  <changefreq>weekly</changefreq>  <!-- ❌ Deprecated -->
  <priority>0.7</priority>  <!-- ❌ Deprecated -->
</url>
```
