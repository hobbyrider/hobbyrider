#!/bin/bash
# Script to set up PayloadCMS database tables via migrations
# Usage: ./scripts/setup-database.sh

set -e

echo "🚀 Setting up PayloadCMS database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo "Please set it: export DATABASE_URL=your_database_url"
  exit 1
fi

# Check if migrations directory exists
if [ ! -d "migrations" ]; then
  echo "📝 Creating initial migration..."
  npm run migrate:create init
else
  echo "✅ Migrations directory already exists"
fi

# Apply migrations
echo "📦 Applying migrations to create tables..."
npm run migrate

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Set these in Vercel:"
echo "   CREATE_FIRST_ADMIN=true"
echo "   FIRST_ADMIN_EMAIL=your-email@example.com"
echo "   FIRST_ADMIN_PASSWORD=your-password"
echo "2. Visit https://payload.hobbyrider.io/api/init-db to create first admin user"
echo "3. Or visit https://payload.hobbyrider.io/admin and create user via UI"
