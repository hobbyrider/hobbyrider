# Directus & Railway Integration Archive

This directory contains the archived Directus CMS and Railway integration files.

## Contents

### Directus Setup Files
- `directus/` - Directus Docker setup and Railway deployment configuration
  - Docker configuration
  - Railway setup guides
  - Deployment instructions

### Directus Integration
- `lib/directus.ts` - Directus SDK client for fetching blog posts and content
- `app/api/blog/` - Blog API routes that used Directus
  - `route.ts` - Fetch blog posts
  - `[slug]/route.ts` - Fetch single blog post

## Status

**Archived**: These files are not currently in use. Directus integration was planned but not actively used in production.

## If You Need to Restore

1. **Restore Directus client**:
   ```bash
   mv .archive/directus-integration/lib/directus.ts lib/
   ```

2. **Restore blog routes**:
   ```bash
   mv .archive/directus-integration/app/api/blog app/api/
   ```

3. **Restore Directus setup**:
   ```bash
   mv .archive/directus-integration/directus ./
   ```

4. **Install dependencies**:
   ```bash
   npm install @directus/sdk
   ```

5. **Set environment variables**:
   ```bash
   DIRECTUS_URL=your_directus_url
   DIRECTUS_TOKEN=your_token  # Optional
   ```

## Notes

- The `@directus/sdk` package is still in `package.json` but can be removed if not needed
- Blog link in footer (`app/components/site-footer.tsx`) may need to be removed or updated
- Blog routes in sitemap (`app/sitemap.ts`) are already commented out

---

**Archived**: 2024-01-21  
**Reason**: Not planning to continue with Directus/Railway integrations for now
