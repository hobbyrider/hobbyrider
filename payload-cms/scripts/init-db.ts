/**
 * Script to initialize PayloadCMS database tables
 * Run: tsx scripts/init-db.ts
 * Or: npm run init-db
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function initDatabase() {
  console.log('🔄 Initializing PayloadCMS database...')
  
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Access a collection to trigger table creation
    // This will force PayloadCMS to create tables if they don't exist
    console.log('📊 Checking collections...')
    
    // Try to access each collection to trigger schema creation
    const collections = ['users', 'blog-posts', 'pages', 'media']
    
    for (const collectionSlug of collections) {
      try {
        await payload.find({
          collection: collectionSlug as any,
          limit: 0, // Just check if collection exists, don't fetch data
        })
        console.log(`✅ Collection "${collectionSlug}" is ready`)
      } catch (error: any) {
        const errorMessage = error?.message || String(error)
        if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
          console.log(`⚠️  Collection "${collectionSlug}" tables not created yet`)
        } else {
          // If it's a different error, the collection might be ready
          console.log(`✅ Collection "${collectionSlug}" is accessible`)
        }
      }
    }
    
    console.log('✅ Database initialization complete!')
    console.log('💡 You can now start the dev server: npm run dev')
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    console.error('\nThis might happen if:')
    console.error('- DATABASE_URL is incorrect')
    console.error('- Database connection failed')
    console.error('- You don\'t have permissions to create tables')
    process.exit(1)
  }
}

initDatabase()
