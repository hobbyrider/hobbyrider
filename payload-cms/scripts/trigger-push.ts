/**
 * Script to manually trigger Drizzle push to create tables
 * This should run Drizzle's push operation directly
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

async function triggerPush() {
  console.log('🔄 Attempting to trigger Drizzle push...')
  
  try {
    // Get PayloadCMS instance
    const payload = await getPayload({ config: configPromise })
    
    // Try to access the db adapter directly
    // PayloadCMS uses Drizzle under the hood, we need to trigger push
    const db = (payload as any).db
    
    if (!db) {
      console.error('❌ Could not access database adapter')
      process.exit(1)
    }
    
    // Check if Drizzle adapter has a push method
    if (typeof db.push === 'function') {
      console.log('✅ Found push method, attempting to push schema...')
      await db.push()
      console.log('✅ Schema push completed!')
    } else {
      console.log('⚠️  Push method not available on adapter')
      console.log('   Available methods:', Object.keys(db).filter(k => typeof db[k] === 'function'))
    }
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Failed to trigger push:', error?.message || String(error))
    process.exit(1)
  }
}

triggerPush()
