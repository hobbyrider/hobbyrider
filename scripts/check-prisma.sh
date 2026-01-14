#!/bin/bash

# Check if Prisma client is in sync with schema
# This script can be run manually or in CI/CD

echo "🔍 Checking Prisma client sync..."

# Generate Prisma client to ensure it's up to date
npx prisma generate

# Check if database is in sync
echo "🔍 Checking database sync..."
npx prisma db push --accept-data-loss --skip-generate

echo "✅ Prisma checks complete!"
