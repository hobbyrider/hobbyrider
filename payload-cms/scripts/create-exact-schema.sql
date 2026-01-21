-- PayloadCMS 3.0 Exact Schema Creation
-- Based on PayloadCMS collections and Drizzle ORM expectations
-- Run this SQL script to create tables with the exact schema PayloadCMS expects

-- Users table (with auth fields)
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT,
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
);

-- Users sessions table (for PayloadCMS auth)
CREATE TABLE IF NOT EXISTS "users_sessions" (
  "id" SERIAL PRIMARY KEY,
  "_parent_id" INTEGER NOT NULL,
  "_order" INTEGER,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "expires_at" TIMESTAMP,
  CONSTRAINT "users_sessions__parent_id_fkey" FOREIGN KEY ("_parent_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "users_sessions__parent_id_idx" ON "users_sessions"("_parent_id")

-- Media table (for uploads)
CREATE TABLE IF NOT EXISTS "media" (
  "id" SERIAL PRIMARY KEY,
  "alt" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Blog Posts table
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
);

CREATE INDEX IF NOT EXISTS "blog_posts_author_idx" ON "blog_posts"("author")
CREATE INDEX IF NOT EXISTS "blog_posts_slug_idx" ON "blog_posts"("slug")

-- Blog Posts tags array table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS "blog_posts_tags" (
  "id" SERIAL PRIMARY KEY,
  "_parent_id" INTEGER NOT NULL,
  "_order" INTEGER,
  "tag" TEXT NOT NULL,
  CONSTRAINT "blog_posts_tags__parent_id_fkey" FOREIGN KEY ("_parent_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "blog_posts_tags__parent_id_idx" ON "blog_posts_tags"("_parent_id")

-- Blog Posts versions table (for drafts)
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
);

CREATE INDEX IF NOT EXISTS "blog_posts_versions__parent_id_idx" ON "blog_posts_versions"("_parent_id")

-- Pages table
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
);

CREATE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages"("slug")

-- Migration tracking table
CREATE TABLE IF NOT EXISTS "_payload_migrations" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "batch" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);
