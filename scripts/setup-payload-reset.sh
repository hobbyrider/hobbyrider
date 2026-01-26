#!/bin/bash

# Payload CMS Password Reset Setup Script
# Run this script after manually cloning the payload-website-starter repository

set -e  # Exit on error

echo "🔧 Payload CMS Password Reset Setup"
echo "==================================="
echo ""

# Check if we're in the payload-website-starter directory
if [ ! -f "payload.config.ts" ] && [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from the payload-website-starter directory"
    echo ""
    echo "Please:"
    echo "  1. Clone the repo: git clone https://github.com/hobbyrider/payload-website-starter.git"
    echo "  2. cd payload-website-starter"
    echo "  3. Run this script again"
    exit 1
fi

echo "📦 Step 1: Installing Vercel CLI (if needed)..."
if ! command -v vercel &> /dev/null; then
    npm i -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI already installed"
fi

echo ""
echo "🔗 Step 2: Linking to Vercel project..."
echo "   (You'll be prompted to select your project)"
vercel link || {
    echo "⚠️  Vercel link failed. You may need to login first: vercel login"
    exit 1
}

echo ""
echo "📥 Step 3: Pulling environment variables..."
vercel env pull .env.local || {
    echo "⚠️  Failed to pull env vars. Make sure you're linked to the correct project."
    exit 1
}
echo "✅ Environment variables pulled"

echo ""
echo "📦 Step 4: Installing dependencies..."
npm install
echo "✅ Dependencies installed"

echo ""
echo "📋 Step 5: Copying reset script..."
SCRIPT_SOURCE="/Users/evaldasbieliunas/ph-clone/scripts/payload-reset-user-standalone.ts"
if [ -f "$SCRIPT_SOURCE" ]; then
    mkdir -p scripts
    cp "$SCRIPT_SOURCE" scripts/reset-user.ts
    echo "✅ Reset script copied to scripts/reset-user.ts"
else
    echo "⚠️  Could not find reset script at $SCRIPT_SOURCE"
    echo "   You'll need to create scripts/reset-user.ts manually"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Next step: Run the reset script with your credentials:"
echo "   npx tsx scripts/reset-user.ts admin@hobbyrider.io YourNewPassword123!"
echo ""
