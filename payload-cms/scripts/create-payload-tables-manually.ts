/**
 * Manual workaround: Create PayloadCMS tables directly
 * This bypasses PayloadCMS's buggy introspection by creating tables manually
 * 
 * Run: tsx scripts/create-payload-tables-manually.ts
 */

import { Pool } from 'pg'
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function createPayloadTables() {
  console.log('🔄 Creating PayloadCMS tables manually...')
  console.log('')
  
  const client = await pool.connect()
  
  try {
    // Create users table (core PayloadCMS table)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT,
        "email" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "reset_password_token" TEXT,
        "reset_password_expiration" TIMESTAMP,
        "salt" TEXT,
        "hash" TEXT,
        "login_attempts" INTEGER DEFAULT 0,
        "lock_until" TIMESTAMP,
        "role" TEXT DEFAULT 'user',
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      );
    `)
    console.log('✅ Created users table')

    // Create users_sessions table (for PayloadCMS auth)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users_sessions" (
        "id" SERIAL PRIMARY KEY,
        "_parent_id" INTEGER,
        "_order" INTEGER,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "expires_at" TIMESTAMP,
        FOREIGN KEY ("_parent_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `)
    console.log('✅ Created users_sessions table')

    // Create blog_posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "blog_posts" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "excerpt" TEXT,
        "content" JSONB,
        "featured_image" INTEGER,
        "author" INTEGER,
        "published_at" TIMESTAMP,
        "status" TEXT DEFAULT 'draft',
        "tags" JSONB,
        "seo_title" TEXT,
        "seo_description" TEXT,
        "seo_image" INTEGER,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("author") REFERENCES "users"("id")
      );
    `)
    console.log('✅ Created blog_posts table')

    // Create pages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "pages" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "content" JSONB,
        "template" TEXT DEFAULT 'default',
        "published" BOOLEAN DEFAULT false,
        "seo_title" TEXT,
        "seo_description" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      );
    `)
    console.log('✅ Created pages table')

    // Create media table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "media" (
        "id" SERIAL PRIMARY KEY,
        "filename" TEXT,
        "alt" TEXT,
        "url" TEXT,
        "mime_type" TEXT,
        "filesize" INTEGER,
        "width" INTEGER,
        "height" INTEGER,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      );
    `)
    console.log('✅ Created media table')

    // Create _payload_migrations table (for PayloadCMS migrations)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_payload_migrations" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT UNIQUE NOT NULL,
        "batch" INTEGER NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW()
      );
    `)
    console.log('✅ Created _payload_migrations table')

    console.log('')
    console.log('✅ All PayloadCMS tables created manually!')
    console.log('')
    console.log('💡 Next steps:')
    console.log('   1. Restart the dev server: npm run dev')
    console.log('   2. Visit http://localhost:3001/admin')
    console.log('   3. Create your first admin user via the UI')
    console.log('')
    console.log('⚠️  Note: These tables might not match PayloadCMS schema exactly.')
    console.log('   PayloadCMS will adjust them when it starts, or you can use migrations.')
    
    client.release()
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to create tables:', error)
    client.release()
    await pool.end()
    process.exit(1)
  }
}

createPayloadTables()
