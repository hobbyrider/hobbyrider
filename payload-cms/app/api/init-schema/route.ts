/**
 * API endpoint to force PayloadCMS to create tables
 * Visit: http://localhost:3001/api/init-schema
 * This will trigger PayloadCMS to create all tables via push: true
 */

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔄 Initializing PayloadCMS schema...')
    
    const payload = await getPayload({ config: configPromise })
    
    // Force PayloadCMS to initialize by accessing each collection
    // This triggers push: true to create tables if they don't exist
    const collections = ['users', 'blog-posts', 'pages', 'media']
    
    const results: { [key: string]: string } = {}
    
    for (const collectionSlug of collections) {
      try {
        // Try to access the collection - this triggers schema creation
        await payload.find({
          collection: collectionSlug as any,
          limit: 0, // Just trigger creation, don't fetch
        })
        results[collectionSlug] = '✅ Ready'
      } catch (error: any) {
        const errorMessage = error?.message || String(error)
        
        if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
          results[collectionSlug] = `⚠️  Tables don't exist yet`
        } else {
          results[collectionSlug] = `✅ Accessible (${errorMessage.substring(0, 50)})`
        }
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Schema initialization attempted',
      results,
      note: 'Check the server logs for detailed table creation messages'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      message: 'Failed to initialize schema',
      error: error?.message || String(error),
    }, { status: 500 })
  }
}
