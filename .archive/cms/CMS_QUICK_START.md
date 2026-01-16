# PayloadCMS Quick Start Guide for Hobbyrider

This is a condensed guide to get PayloadCMS up and running quickly.

## Prerequisites

- ✅ Next.js 16.1.1 (already installed)
- ✅ PostgreSQL database (already configured)
- ✅ TypeScript (already configured)

## Installation Steps

### 1. Install Dependencies

```bash
npm install payload @payloadcms/db-postgres @payloadcms/richtext-lexical
npm install -D @payloadcms/bundler-webpack
```

### 2. Create Payload Configuration

Create `payload.config.ts` in project root:

```typescript
import { buildConfig } from 'payload/config'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'

export default buildConfig({
  admin: {
    user: 'users', // Use 'users' collection for admin
  },
  collections: [
    // Collections will be added here
  ],
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL, // Uses your existing PostgreSQL
    },
  }),
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  serverURL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  secret: process.env.PAYLOAD_SECRET || '',
})

// Note: This uses PostgreSQL (your current database), NOT Cloudflare D1
// The Cloudflare D1 template is for Cloudflare Workers deployment
```

### 3. Create API Route

Create `app/api/payload/[...slug]/route.ts`:

```typescript
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  return payload.router.handleRequest(request)
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  return payload.router.handleRequest(request)
}
```

### 4. Create Admin Route

Create `app/admin/[[...segments]]/page.tsx`:

```typescript
import { PayloadAdminBar } from 'payload/components'
import config from '@/payload.config'

export default async function AdminPage() {
  return <PayloadAdminBar config={config} />
}
```

### 5. Add Environment Variables

Add to `.env.local`:
```bash
PAYLOAD_SECRET=your_secret_here  # Generate: openssl rand -base64 32
```

### 6. Create First Collection (Blog Posts)

Create `collections/BlogPosts.ts`:

```typescript
import { CollectionConfig } from 'payload/types'

const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true, // Public read access
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version of title',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'publishedAt',
      type: 'date',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
    },
  ],
}

export default BlogPosts
```

### 7. Update payload.config.ts

Add the collection:
```typescript
import BlogPosts from './collections/BlogPosts'

export default buildConfig({
  // ... existing config
  collections: [
    BlogPosts,
  ],
})
```

### 8. Generate Types

```bash
npx payload generate:types
```

### 9. Access Admin UI

Visit: `http://localhost:3000/admin`

Create your first admin user when prompted.

## Next Steps

1. Create blog listing page: `app/blog/page.tsx`
2. Create blog post page: `app/blog/[slug]/page.tsx`
3. Add more collections as needed
4. Customize admin UI

## Common Issues

### Issue: "PAYLOAD_SECRET is required"
**Solution:** Add `PAYLOAD_SECRET` to `.env.local`

### Issue: Database connection errors
**Solution:** Verify `DATABASE_URL` is set correctly

### Issue: Admin UI not loading
**Solution:** Check that API route is correctly configured

## Resources

- Full docs: https://payloadcms.com/docs
- Example projects: https://github.com/payloadcms/payload/tree/main/examples
