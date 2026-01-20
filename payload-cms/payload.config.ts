import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import BlogPosts from './collections/BlogPosts'
import Pages from './collections/Pages'
import Media from './collections/Media'
import Users from './collections/Users'

// Get DATABASE_URL with proper error handling
function getDatabaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'Missing DATABASE_URL. Add it to .env.local (local) and Vercel Environment Variables (prod).'
    )
  }
  return url
}

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [
    Users,
    BlogPosts,
    Pages,
    Media,
  ],
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: getDatabaseUrl(),
    },
    push: true, // Allow PayloadCMS to create its own tables
  }),
  typescript: {
    outputFile: path.resolve(process.cwd(), 'payload-types.ts'),
  },
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 
             process.env.NEXTAUTH_URL || 
             (process.env.VERCEL_URL 
               ? `https://${process.env.VERCEL_URL}` 
               : 'http://localhost:3000'),
  secret: process.env.PAYLOAD_SECRET || '',
})
