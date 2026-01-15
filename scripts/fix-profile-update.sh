#!/bin/bash

# Fix profile update issues by ensuring Prisma is in sync

echo "🔧 Fixing profile update setup..."

# Clear Next.js cache
echo "📦 Clearing Next.js cache..."
rm -rf .next

# Regenerate Prisma client
echo "🔄 Regenerating Prisma client..."
npx prisma generate

# Push schema to database
echo "💾 Syncing database schema..."
npx prisma db push

echo "✅ Done! Please restart your dev server: npm run dev"
