# PayloadCMS Setup Guide for Hobbyrider

**Status:** ✅ **INSTALLED** - PayloadCMS is now integrated into hobbyrider

---

## What's Been Installed

✅ PayloadCMS 3.71.1 with PostgreSQL adapter  
✅ Blog Posts collection  
✅ Pages collection (for static CMS pages)  
✅ Media collection (for file uploads)  
✅ Users collection (for admin authentication)  
✅ Admin UI at `/admin`  
✅ Blog listing page at `/blog`  
✅ Blog post pages at `/blog/[slug]`  

---

## Environment Variables Required

Add these to your `.env.local` and Vercel environment variables:

```bash
# PayloadCMS Configuration
PAYLOAD_SECRET=your_secret_key_here  # Generate with: openssl rand -base64 32
```

**Generate PAYLOAD_SECRET:**
```bash
openssl rand -base64 32
```

---

## First-Time Setup

### 1. Set Environment Variable

Add `PAYLOAD_SECRET` to `.env.local`:
```bash
PAYLOAD_SECRET=your_generated_secret_here
```

### 2. Run Database Migrations

PayloadCMS will create its own tables in your PostgreSQL database. Run:

```bash
npm run dev
```

On first run, Payload will:
- Create database tables (prefixed with `payload_`)
- Set up the admin UI
- Prompt you to create the first admin user

### 3. Access Admin UI

1. Start your dev server: `npm run dev`
2. Visit: `http://localhost:3000/admin`
3. Create your first admin user when prompted

### 4. Create Your First Blog Post

1. In the admin UI, go to **Blog Posts**
2. Click **Create New**
3. Fill in:
   - Title
   - Slug (auto-generated from title)
   - Content (rich text editor)
   - Featured Image (optional)
   - Author (select yourself)
   - Published At (date)
   - Status: **Published**
4. Click **Save**

### 5. View Your Blog

- Blog listing: `http://localhost:3000/blog`
- Individual post: `http://localhost:3000/blog/your-post-slug`

---

## Collections Overview

### Blog Posts (`blog-posts`)
- **Fields:** title, slug, excerpt, content (rich text), featuredImage, author, publishedAt, status, tags, SEO fields
- **Status:** draft, published, archived
- **Access:** Public read, authenticated users can create/edit

### Pages (`pages`)
- **Fields:** title, slug, content (rich text), template, published, SEO fields
- **Templates:** default, landing, about
- **Access:** Public read for published pages, authenticated users can create/edit

### Media (`media`)
- **Fields:** file upload, alt text
- **Storage:** Local storage (can be configured for Vercel Blob)
- **Access:** Public read, authenticated users can upload

### Users (`users`)
- **Fields:** name, email, role
- **Roles:** admin, editor, author, user
- **Auth:** Built-in Payload authentication

---

## File Structure

```
ph-clone/
├── app/
│   ├── (payload)/              # Payload route group
│   │   ├── admin/              # Admin UI
│   │   │   ├── [[...segments]]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── not-found.tsx
│   │   │   └── importMap.ts
│   │   └── layout.tsx          # Payload layout wrapper
│   ├── api/
│   │   └── payload/
│   │       └── [...slug]/
│   │           └── route.ts    # Payload API routes
│   ├── blog/
│   │   ├── page.tsx            # Blog listing
│   │   └── [slug]/
│   │       └── page.tsx        # Individual blog post
├── collections/
│   ├── BlogPosts.ts
│   ├── Pages.ts
│   ├── Media.ts
│   └── Users.ts
├── payload.config.ts           # Payload configuration
└── payload-types.ts            # Auto-generated types
```

---

## Using PayloadCMS

### Creating Content

1. **Access Admin UI:** `/admin`
2. **Navigate to Collection:** Click on "Blog Posts" or "Pages" in sidebar
3. **Create New:** Click "Create New" button
4. **Fill Fields:** Use the rich text editor for content
5. **Set Status:** Choose "Published" to make it live
6. **Save:** Click "Save" or "Save & Publish"

### Rich Text Editor

PayloadCMS uses Lexical editor with features:
- Bold, italic, underline
- Headings (H1-H6)
- Lists (ordered, unordered)
- Links
- Code blocks
- And more...

### Media Management

1. Go to **Media** in admin sidebar
2. Click **Upload** or drag & drop files
3. Files are stored locally (can be configured for Vercel Blob)
4. Use uploaded media in blog posts and pages

---

## Integration with Existing System

### Database
- ✅ **Shared PostgreSQL database** - Payload tables are prefixed with `payload_`
- ✅ **No conflicts** - Payload and Prisma can coexist
- ✅ **Can relate** - Can create relationships between Payload collections and Prisma models

### Authentication
- ⚠️ **Separate auth systems:**
  - NextAuth for frontend (existing users)
  - Payload auth for admin UI (separate users)
- 💡 **Future:** Can integrate by syncing users or using custom adapter

### Media Storage
- Currently using **local storage** (files in `media/` directory)
- Can be configured to use **Vercel Blob** (recommended for production)

---

## Customization

### Adding More Collections

1. Create new file in `collections/`:
```typescript
// collections/MyCollection.ts
import type { CollectionConfig } from 'payload'

const MyCollection: CollectionConfig = {
  slug: 'my-collection',
  fields: [
    // your fields
  ],
}

export default MyCollection
```

2. Import in `payload.config.ts`:
```typescript
import MyCollection from './collections/MyCollection'

export default buildConfig({
  collections: [
    // ... existing collections
    MyCollection,
  ],
})
```

### Customizing Admin UI

- Edit `payload.config.ts` to customize admin settings
- Add custom components via `importMap`
- Customize colors, branding in admin config

---

## Troubleshooting

### Issue: "PAYLOAD_SECRET is required"
**Solution:** Add `PAYLOAD_SECRET` to `.env.local`

### Issue: Database connection errors
**Solution:** Verify `DATABASE_URL` is set correctly

### Issue: Admin UI not loading
**Solution:** 
- Check that API route is accessible: `/api/payload`
- Verify `PAYLOAD_SECRET` is set
- Check browser console for errors

### Issue: Rich text not rendering
**Solution:** 
- Install Lexical renderer: `npm install @payloadcms/richtext-lexical`
- Use proper renderer component in blog post page

### Issue: Build errors with Turbopack
**Solution:**
- PayloadCMS works better with webpack
- Run dev with: `next dev --webpack`
- Or configure `next.config.ts` to use webpack

---

## Next Steps

1. ✅ **Set PAYLOAD_SECRET** in environment variables
2. ✅ **Create first admin user** at `/admin`
3. ✅ **Create first blog post**
4. ⚠️ **Configure media storage** (Vercel Blob for production)
5. ⚠️ **Improve rich text rendering** (use Lexical renderer)
6. ⚠️ **Add blog to sitemap** (update `app/sitemap.ts`)
7. ⚠️ **Style blog pages** (match your design system)

---

## Resources

- **PayloadCMS Docs:** https://payloadcms.com/docs
- **Next.js Integration:** https://payloadcms.com/blog/the-ultimate-guide-to-using-nextjs-with-payload
- **Community Discord:** https://discord.gg/payload

---

## Production Deployment

### Vercel Environment Variables

Add to Vercel dashboard:
- `PAYLOAD_SECRET` - Your generated secret key
- `DATABASE_URL` - Your PostgreSQL connection (already set)
- `NEXTAUTH_URL` - Your production URL (already set)

### Media Storage (Production)

For production, configure Vercel Blob storage:

1. Update `collections/Media.ts`:
```typescript
upload: {
  adapter: // Vercel Blob adapter (if available)
  // or use local storage
}
```

2. Or use existing Vercel Blob setup via API route

---

*PayloadCMS is now ready to use! Visit `/admin` to start creating content.*
