// Script to force PayloadCMS to create tables
// This should work with push: true and NODE_ENV=development

import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function forceCreateTables() {
  try {
    console.log('Initializing PayloadCMS...')
    const payload = await getPayload({ config: configPromise })
    
    console.log('PayloadCMS initialized')
    console.log('Attempting to access collections to trigger table creation...')
    
    // Try to access each collection - this should trigger table creation with push: true
    const collections = ['users', 'blog-posts', 'pages', 'media']
    
    for (const collection of collections) {
      try {
        await payload.find({
          collection: collection as any,
          limit: 0,
        })
        console.log(`✅ ${collection} table exists`)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        if (errorMsg.includes('does not exist') || errorMsg.includes('relation')) {
          console.log(`⚠️ ${collection} table doesn't exist yet - PayloadCMS should create it with push: true`)
          // Wait a moment and try again
          await new Promise(resolve => setTimeout(resolve, 500))
          try {
            await payload.find({
              collection: collection as any,
              limit: 0,
            })
            console.log(`✅ ${collection} table created`)
          } catch (retryError) {
            console.error(`❌ Failed to create ${collection} table:`, retryError)
          }
        } else {
          console.error(`❌ Error accessing ${collection}:`, errorMsg)
        }
      }
    }
    
    console.log('✅ Done!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed:', error)
    process.exit(1)
  }
}

forceCreateTables()
