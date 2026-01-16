# Archived Documentation & Code

This folder (`.archive/`) contains archived documentation and code that is not currently in use.

**Note:** This folder is excluded from TypeScript compilation and Next.js builds to prevent build errors.

## Structure

- **`payloadcms/`** - PayloadCMS integration (currently disabled)
  - Documentation files (`.md`)
  - `code/` - PayloadCMS code (collections, config, routes)
  
- **`cms/`** - CMS implementation planning documents (not implemented)

## Why Archived?

PayloadCMS integration was paused due to HTML nesting conflicts with Next.js App Router. The integration will be resumed when a subdomain is available (e.g., `admin.hobbyrider.com`).

## Re-enabling PayloadCMS

When ready to re-enable:

1. Move `payloadcms/code/collections/` back to project root
2. Move `payloadcms/code/payload.config.ts` back to project root
3. Move `payloadcms/code/(payload-disabled)/` back to `app/(payload)/`
4. Move `payloadcms/code/payload/` back to `app/api/payload/`
5. Move `payloadcms/code/blog/` back to `app/(main)/blog/`
6. Move `payloadcms/code/rich-text.tsx` back to `app/components/rich-text.tsx`
7. Uncomment PayloadCMS code in `app/sitemap.ts`
8. Uncomment `withPayload` in `next.config.ts`
9. See `payloadcms/DISABLE_PAYLOADCMS.md` for detailed instructions
