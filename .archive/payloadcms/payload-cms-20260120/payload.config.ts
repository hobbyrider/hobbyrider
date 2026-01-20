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
    migrationDir: path.resolve(process.cwd(), 'src/migrations'),
  }),
  typescript: {
    outputFile: path.resolve(process.cwd(), 'payload-types.ts'),
  },
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://payload.hobbyrider.io',
  secret: getPayloadSecret(),
  onInit: async (payload) => {
    // Create first admin user if none exists
    // Set CREATE_FIRST_ADMIN=true and FIRST_ADMIN_EMAIL, FIRST_ADMIN_PASSWORD in Vercel env vars
    if (process.env.CREATE_FIRST_ADMIN === 'true') {
      try {
        // Wait a bit to ensure tables are created (push: true should create them)
        await new Promise(resolve => setTimeout(resolve, 1000))

        const existingUsers = await payload.find({
          collection: 'users',
          limit: 1,
        })

        if (existingUsers.totalDocs === 0) {
          const email = process.env.FIRST_ADMIN_EMAIL || 'admin@hobbyrider.io'
          const password = process.env.FIRST_ADMIN_PASSWORD

          if (!password) {
            payload.logger.warn('⚠️ CREATE_FIRST_ADMIN=true but FIRST_ADMIN_PASSWORD is not set. Skipping user creation.')
            return
          }

          await payload.create({
            collection: 'users',
            data: {
              email,
              password,
              name: 'Admin',
              role: 'admin',
            },
          })

          payload.logger.info(`✅ First admin user created: ${email}`)
        } else {
          payload.logger.info('✅ Admin user already exists. Skipping creation.')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        // If tables don't exist yet, that's okay - they'll be created on first request
        if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
          payload.logger.info('ℹ️ Tables not created yet. First admin user will be created after tables are initialized.')
        } else {
          payload.logger.error(`❌ Failed to create first admin user: ${errorMessage}`)
        }
      }
    }
  },
})
