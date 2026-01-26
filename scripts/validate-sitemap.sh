#!/bin/bash
# Sitemap validation script
# Validates that the sitemap.xml is Google-compliant

BASE_URL="${1:-http://localhost:3000}"
SITEMAP_URL="${BASE_URL}/sitemap.xml"

echo "🔍 Validating sitemap at: ${SITEMAP_URL}"
echo ""

# Fetch sitemap
RESPONSE=$(curl -s -w "\n%{http_code}" "${SITEMAP_URL}")
HTTP_CODE=$(echo "${RESPONSE}" | tail -n1)
BODY=$(echo "${RESPONSE}" | sed '$d')

# Check HTTP status
if [ "${HTTP_CODE}" != "200" ]; then
  echo "❌ Error: HTTP ${HTTP_CODE}"
  exit 1
fi

echo "✅ HTTP Status: ${HTTP_CODE}"
echo ""

# Check Content-Type header
CONTENT_TYPE=$(curl -s -I "${SITEMAP_URL}" | grep -i "content-type" | cut -d' ' -f2- | tr -d '\r\n')
echo "📄 Content-Type: ${CONTENT_TYPE}"

if [[ ! "${CONTENT_TYPE}" =~ "application/xml" ]] && [[ ! "${CONTENT_TYPE}" =~ "text/xml" ]]; then
  echo "⚠️  Warning: Content-Type should be application/xml or text/xml"
fi

echo ""

# Validate XML structure
echo "🔎 Validating XML structure..."

# Check for XML declaration
if ! echo "${BODY}" | grep -q '^<?xml'; then
  echo "⚠️  Warning: Missing XML declaration (optional but recommended)"
fi

# Check for urlset namespace
if ! echo "${BODY}" | grep -q 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'; then
  echo "❌ Error: Missing or incorrect urlset namespace"
  exit 1
fi

echo "✅ XML structure valid"
echo ""

# Check for deprecated fields
echo "🔎 Checking for deprecated fields..."

CHANGEFREQ_COUNT=$(echo "${BODY}" | grep -c "<changefreq>" || echo "0")
PRIORITY_COUNT=$(echo "${BODY}" | grep -c "<priority>" || echo "0")

if [ "${CHANGEFREQ_COUNT}" -gt 0 ]; then
  echo "❌ Error: Found ${CHANGEFREQ_COUNT} <changefreq> tags (deprecated, must be removed)"
  exit 1
fi

if [ "${PRIORITY_COUNT}" -gt 0 ]; then
  echo "❌ Error: Found ${PRIORITY_COUNT} <priority> tags (deprecated, must be removed)"
  exit 1
fi

echo "✅ No deprecated fields found"
echo ""

# Validate required fields
echo "🔎 Validating required fields..."

LOC_COUNT=$(echo "${BODY}" | grep -c "<loc>" || echo "0")
LASTMOD_COUNT=$(echo "${BODY}" | grep -c "<lastmod>" || echo "0")

if [ "${LOC_COUNT}" -eq 0 ]; then
  echo "❌ Error: No <loc> tags found"
  exit 1
fi

echo "✅ Found ${LOC_COUNT} URLs (<loc> tags)"

if [ "${LASTMOD_COUNT}" -eq 0 ]; then
  echo "⚠️  Warning: No <lastmod> tags found (optional but recommended)"
else
  echo "✅ Found ${LASTMOD_COUNT} lastmod entries"
  
  # Validate lastmod format (should be YYYY-MM-DD)
  INVALID_LASTMOD=$(echo "${BODY}" | grep -oP '<lastmod>\K[^<]+' | grep -vE '^\d{4}-\d{2}-\d{2}$' | wc -l)
  if [ "${INVALID_LASTMOD}" -gt 0 ]; then
    echo "⚠️  Warning: Some lastmod values are not in YYYY-MM-DD format"
    echo "${BODY}" | grep -oP '<lastmod>\K[^<]+' | grep -vE '^\d{4}-\d{2}-\d{2}$' | head -5
  else
    echo "✅ All lastmod values are in YYYY-MM-DD format"
  fi
fi

echo ""

# Count URLs
URL_COUNT=$(echo "${BODY}" | grep -c "<url>" || echo "0")
echo "📊 Summary:"
echo "   - Total URLs: ${URL_COUNT}"
echo "   - <loc> tags: ${LOC_COUNT}"
echo "   - <lastmod> tags: ${LASTMOD_COUNT}"
echo "   - <changefreq> tags: ${CHANGEFREQ_COUNT} (should be 0)"
echo "   - <priority> tags: ${PRIORITY_COUNT} (should be 0)"
echo ""

# Show sample URLs
echo "📋 Sample URLs (first 5):"
echo "${BODY}" | grep -oP '<loc>\K[^<]+' | head -5 | sed 's/^/   - /'
echo ""

echo "✅ Sitemap validation passed!"
echo ""
echo "💡 To test with production URL:"
echo "   ./scripts/validate-sitemap.sh https://hobbyrider.io"
