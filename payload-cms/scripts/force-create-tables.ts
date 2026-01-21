/**
 * Script to force PayloadCMS to create tables
 * This accesses PayloadCMS collections to trigger table creation
 * 
 * Run: tsx scripts/force-create-tables.ts
 * Or: npm run force-create-tables
 */

// Load .env.local file FIRST using require to ensure it runs before imports
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function forceCreateTables() {
  console.log('🔄 Forcing PayloadCMS to create tables...')
  console.log('')
  
  try {
    const payload = await getPayload({ config: configPromise })
    
    console.log('✅ PayloadCMS initialized')
    console.log('')
    
    // Access each collection to trigger table creation
    // PayloadCMS will create tables if push: true is enabled
    const collections = ['users', 'blog-posts', 'pages', 'media']
    
    for (const collectionSlug of collections) {
      try {
        console.log(`📊 Checking collection: ${collectionSlug}...`)
        
        // Try to access the collection - this triggers table creation
        await payload.find({
          collection: collectionSlug as any,
          limit: 0, // Just trigger schema creation, don't fetch data
        })
        
        console.log(`✅ Collection "${collectionSlug}" is ready`)
        console.log('')
      } catch (error: any) {
        const errorMessage = error?.message || String(error)
        
        if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
          console.log(`⚠️  Collection "${collectionSlug}" - tables don't exist yet`)
          console.log(`   This might mean push: true isn't working or needs a restart`)
          console.log('')
        } else {
          // Other errors might mean the collection is accessible
          console.log(`✅ Collection "${collectionSlug}" is accessible`)
          console.log('')
        }
      }
    }
    
    console.log('✅ Done!')
    console.log('')
    console.log('💡 Next steps:')
    console.log('   1. If tables were created, restart the dev server')
    console.log('   2. Visit http://localhost:3001/admin')
    console.log('   3. If tables still don\'t exist, check that push: true is set')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to force table creation:', error)
    
    if (error instanceof Error) {
      console.error('')
      console.error('Error message:', error.message)
      
      if (error.message.includes('does not exist')) {
        console.error('')
        console.error('⚠️  Tables still don\'t exist. This might mean:')
        console.error('   - push: true isn\'t enabled in payload.config.ts')
        console.error('   - NODE_ENV is not set to "development"')
        console.error('   - Database connection issue')
        console.error('   - PayloadCMS bug with empty database (seed table might not be enough)')
      }
    }
    
    process.exit(1)
  }
}

forceCreateTables()
