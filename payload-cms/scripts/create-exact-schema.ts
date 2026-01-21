/**
 * Script to create PayloadCMS tables with exact schema
 * Based on PayloadCMS 3.0 collections and Drizzle ORM expectations
 * 
 * Run: tsx scripts/create-exact-schema.ts
 * Or: npm run create-exact-schema
 */

import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'
require('dotenv').config({ path: resolve(process.cwd(), '.env.local') })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function createExactSchema() {
  console.log('🔄 Creating PayloadCMS tables with exact schema...')
  console.log('')
  
  const client = await pool.connect()
  
  try {
    // Create tables one by one with proper error handling
    console.log('📋 Creating PayloadCMS tables...')
    console.log('')
    
    // Users table (must be first)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT,
        "role" TEXT DEFAULT 'user',
        "salt" TEXT,
        "hash" TEXT,
        "reset_password_token" TEXT,
        "reset_password_expiration" TIMESTAMP,
        "login_attempts" INTEGER DEFAULT 0,
        "lock_until" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ Created table: users')
    
    // Users sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users_sessions" (
        "id" SERIAL PRIMARY KEY,
        "_parent_id" INTEGER NOT NULL,
        "_order" INTEGER,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "expires_at" TIMESTAMP,
        CONSTRAINT "users_sessions__parent_id_fkey" FOREIGN KEY ("_parent_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `)
    console.log('✅ Created table: users_sessions')
    
    await client.query(`CREATE INDEX IF NOT EXISTS "users_sessions__parent_id_idx" ON "users_sessions"("_parent_id")`)
    console.log('✅ Created index: users_sessions__parent_id_idx')
    
    // Media table (needed for foreign keys)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "media" (
        "id" SERIAL PRIMARY KEY,
        "alt" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ Created table: media')
    
    // Blog Posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "blog_posts" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "excerpt" TEXT,
        "content" JSONB,
        "featured_image" INTEGER,
        "author" INTEGER NOT NULL,
        "published_at" TIMESTAMP,
        "status" TEXT DEFAULT 'draft',
        "tags" JSONB,
        "seo_title" TEXT,
        "seo_description" TEXT,
        "seo_image" INTEGER,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        CONSTRAINT "blog_posts_author_fkey" FOREIGN KEY ("author") REFERENCES "users"("id"),
        CONSTRAINT "blog_posts_featured_image_fkey" FOREIGN KEY ("featured_image") REFERENCES "media"("id") ON DELETE SET NULL,
        CONSTRAINT "blog_posts_seo_image_fkey" FOREIGN KEY ("seo_image") REFERENCES "media"("id") ON DELETE SET NULL
      )
    `)
    console.log('✅ Created table: blog_posts')
    
    await client.query(`CREATE INDEX IF NOT EXISTS "blog_posts_author_idx" ON "blog_posts"("author")`)
    await client.query(`CREATE INDEX IF NOT EXISTS "blog_posts_slug_idx" ON "blog_posts"("slug")`)
    console.log('✅ Created indexes for blog_posts')
    
    // Blog Posts tags array table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "blog_posts_tags" (
        "id" SERIAL PRIMARY KEY,
        "_parent_id" INTEGER NOT NULL,
        "_order" INTEGER,
        "tag" TEXT NOT NULL,
        CONSTRAINT "blog_posts_tags__parent_id_fkey" FOREIGN KEY ("_parent_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE
      )
    `)
    console.log('✅ Created table: blog_posts_tags')
    
    await client.query(`CREATE INDEX IF NOT EXISTS "blog_posts_tags__parent_id_idx" ON "blog_posts_tags"("_parent_id")`)
    
    // Blog Posts versions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "blog_posts_versions" (
        "id" SERIAL PRIMARY KEY,
        "_parent_id" INTEGER NOT NULL,
        "_version_created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "title" TEXT,
        "slug" TEXT,
        "excerpt" TEXT,
        "content" JSONB,
        "featured_image" INTEGER,
        "author" INTEGER,
        "published_at" TIMESTAMP,
        "status" TEXT,
        "tags" JSONB,
        "seo_title" TEXT,
        "seo_description" TEXT,
        "seo_image" INTEGER,
        CONSTRAINT "blog_posts_versions__parent_id_fkey" FOREIGN KEY ("_parent_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE
      )
    `)
    console.log('✅ Created table: blog_posts_versions')
    
    await client.query(`CREATE INDEX IF NOT EXISTS "blog_posts_versions__parent_id_idx" ON "blog_posts_versions"("_parent_id")`)
    
    // Pages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "pages" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "content" JSONB NOT NULL,
        "template" TEXT DEFAULT 'default',
        "published" BOOLEAN DEFAULT false,
        "seo_title" TEXT,
        "seo_description" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ Created table: pages')
    
    await client.query(`CREATE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages"("slug")`)
    
    // Migration tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_payload_migrations" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "batch" INTEGER NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ Created table: _payload_migrations')
    
    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'users_sessions', 'blog_posts', 'pages', 'media', '_payload_migrations')
      ORDER BY table_name;
    `)
    
    console.log('✅ Tables created:')
    tablesResult.rows.forEach((row: any) => {
      console.log(`   - ${row.table_name}`)
    })
    
    console.log('')
    console.log('✅ PayloadCMS tables created with exact schema!')
    console.log('')
    console.log('💡 Next steps:')
    console.log('   1. Restart the dev server: npm run dev')
    console.log('   2. Visit http://localhost:3001/admin')
    console.log('   3. Create your first admin user via the UI')
    console.log('')
    console.log('✅ Tables should now match PayloadCMS\'s expected schema exactly')
    
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

createExactSchema()
