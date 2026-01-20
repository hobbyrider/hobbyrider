import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import BlogPosts from './collections/BlogPosts.js'
import Pages from './collections/Pages.js'
import Media from './collections/Media.js'
import Users from './collections/Users.js'

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

// Get PAYLOAD_SECRET with proper error handling
function getPayloadSecret() {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error(
      'Missing PAYLOAD_SECRET. Generate with: openssl rand -base64 32\n' +
      'Add it to .env.local (local) and Vercel Environment Variables (prod).'
    )
  }
  return secret
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
  secret: getPayloadSecret(),
})
