// Script to initialize PayloadCMS database tables
// Run this once to create PayloadCMS tables in the database

import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function initDatabase() {
  try {
    console.log('Initializing PayloadCMS database...')
    
    const payload = await getPayload({ config: configPromise })
    
    // This will trigger PayloadCMS to create all necessary tables
    // The push: true in config should handle this, but we're ensuring it happens
    console.log('PayloadCMS initialized. Tables should be created.')
    
    await payload.db.push({
      force: false, // Don't force - only create if missing
    })
    
    console.log('✅ Database initialization complete!')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

initDatabase()
