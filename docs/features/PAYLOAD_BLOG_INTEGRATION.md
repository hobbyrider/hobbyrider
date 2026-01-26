# Payload CMS Blog Integration

This document describes how the Hobbyrider blog integrates with Payload CMS.

## Overview

The blog at `https://hobbyrider.io/blog` fetches content from a separate Payload CMS instance deployed at `https://payload.hobbyrider.io`. This allows content creators to manage blog posts through Payload's admin interface while displaying them on the main Hobbyrider site.

## Architecture

- **Payload CMS**: Deployed separately at `payload.hobbyrider.io`
- **Hobbyrider App**: Fetches published posts via Payload's REST API
- **Blog Routes**: 
  - `/blog` - Lists all published posts
  - `/blog/[slug]` - Individual post pages

## Environment Variables

Add to `.env.local` (local) and Vercel Environment Variables (production):

```env
PAYLOAD_PUBLIC_SERVER_URL=https://payload.hobbyrider.io
```

**Alternative variable name** (also supported):
```env
NEXT_PUBLIC_PAYLOAD_URL=https://payload.hobbyrider.io
```

## How It Works

### 1. Fetching Posts

The `lib/payload.ts` module provides helper functions:

- `getPublishedPosts()` - Fetches all published posts
- `getPostBySlug(slug)` - Fetches a single post by slug
- `getAllPostSlugs()` - Gets all post slugs for sitemap generation

All functions:
- Only fetch posts with `_status: 'published'`
- Cache responses for 60 seconds (ISR)
- Handle errors gracefully (return empty arrays/null)

### 2. Blog Listing Page

`app/blog/page.tsx`:
- Displays all published posts
- Shows title, description, and publish date
- Mobile-responsive layout
- Uses typography components (no direct Tailwind text classes)

### 3. Blog Post Detail Page

`app/blog/[slug]/page.tsx`:
- Displays individual post content
- Shows hero image, author, categories
- Generates static params for all published posts (SSG)
- Includes proper SEO metadata (title, description, OG tags)

### 4. Sitemap Integration

`app/sitemap.ts`:
- Automatically includes all published blog posts
- Updates when posts are published/unpublished
- Revalidates every hour

## Content Rendering

**Current Status**: Posts are fetched but Lexical content rendering is not yet implemented.

Payload stores content in **Lexical JSON format**. To render it properly, you need to:

1. Install a Lexical renderer:
   ```bash
   npm install @payloadcms/richtext-lexical
   ```

2. Convert Lexical JSON to HTML in the post detail page

3. Or use Payload's built-in renderer if available

**Temporary**: The detail page shows a placeholder message until rendering is implemented.

## CORS Configuration

Make sure Payload CMS allows requests from `hobbyrider.io`:

In `payload-website-starter/src/payload.config.ts`, ensure CORS is configured:

```typescript
cors: [
  'https://hobbyrider.io',
  'https://www.hobbyrider.io',
  'http://localhost:3000', // For local development
],
```

## Publishing Workflow

1. **Create/Edit Post** in Payload Admin (`https://payload.hobbyrider.io/admin`)
2. **Set Status** to "Published"
3. **Save** - Post automatically appears on `hobbyrider.io/blog` within 60 seconds (ISR cache)

## Caching Strategy

- **Blog Listing**: Revalidates every 60 seconds
- **Individual Posts**: Revalidates every 60 seconds
- **Sitemap**: Revalidates every hour
- **Static Generation**: All published posts are pre-rendered at build time

## Troubleshooting

### Posts Not Appearing

1. Check `PAYLOAD_PUBLIC_SERVER_URL` is set correctly
2. Verify post status is "Published" (not "Draft")
3. Check Payload API is accessible: `https://payload.hobbyrider.io/api/posts?where[_status][equals]=published`
4. Check browser console for fetch errors

### CORS Errors

If you see CORS errors in the browser console:
1. Verify Payload's `cors` config includes `hobbyrider.io`
2. Check Payload deployment is live and accessible
3. Verify environment variables are set in both local and production

### Content Not Rendering

If post content shows placeholder text:
- Lexical renderer is not yet implemented
- See "Content Rendering" section above for implementation steps

## Future Enhancements

- [ ] Implement Lexical content rendering
- [ ] Add webhook-based revalidation (instant updates on publish)
- [ ] Add blog post categories page
- [ ] Add related posts section
- [ ] Add RSS feed generation
- [ ] Add search functionality

## Related Files

- `lib/payload.ts` - Payload API helpers
- `app/blog/page.tsx` - Blog listing page
- `app/blog/[slug]/page.tsx` - Post detail page
- `app/sitemap.ts` - Sitemap with blog posts
