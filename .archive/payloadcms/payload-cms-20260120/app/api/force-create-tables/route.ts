// API route to force PayloadCMS to create database tables
// This is a workaround for production where push: true may not work automatically
// GET /api/force-create-tables?token=YOUR_PAYLOAD_INIT_TOKEN

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Only allow in production with a secret token for security
  const initToken = process.env.PAYLOAD_INIT_TOKEN || 'change-me-in-production'
  const url = new URL(request.url)
  const providedToken = url.searchParams.get('token')

  // For security, require a token (set PAYLOAD_INIT_TOKEN in Vercel)
  if (process.env.NODE_ENV === 'production' && providedToken !== initToken) {
    return NextResponse.json(
      { 
        error: 'Unauthorized', 
        message: 'Provide ?token=YOUR_PAYLOAD_INIT_TOKEN in the URL',
        hint: 'Set PAYLOAD_INIT_TOKEN in Vercel environment variables'
      },
      { status: 401 }
    )
  }

  try {
    console.log('Forcing PayloadCMS table creation...')
    
    // Initialize PayloadCMS
    const payload = await getPayload({ config: configPromise })
    
    // Access the database adapter directly
    const db = payload.db
    
    // Try to access all collections to trigger table creation
    // This forces PayloadCMS to push the schema if push: true is enabled
    const collections = ['users', 'blog_posts', 'pages', 'media']
    
    const results = []
    
    for (const collection of collections) {
      try {
        // Try to query each collection - this will trigger table creation if push: true is enabled
        await payload.find({
          collection: collection as any,
          limit: 0,
        })
        results.push({ collection, status: 'exists' })
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        if (errorMsg.includes('does not exist') || errorMsg.includes('relation')) {
          // Table doesn't exist - PayloadCMS should create it with push: true
          results.push({ collection, status: 'creating...' })
          
          // Try accessing it again after a short delay - this might trigger creation
          await new Promise(resolve => setTimeout(resolve, 500))
          
          try {
            await payload.find({
              collection: collection as any,
              limit: 0,
            })
            results.push({ collection, status: 'created' })
          } catch (retryError) {
            results.push({ collection, status: 'failed', error: errorMsg })
          }
        } else {
          results.push({ collection, status: 'error', error: errorMsg })
        }
      }
    }
    
    // Check if tables were created
    try {
      const userCount = await payload.find({
        collection: 'users',
        limit: 1,
      })
      
      return NextResponse.json({
        success: true,
        message: 'Tables creation attempted',
        results,
        note: 'If tables were created, you can now create the first admin user via /api/init-db',
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Tables may not have been created',
        results,
        error: 'You may need to use migrations. See payload-cms/MIGRATIONS.md',
      }, { status: 500 })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('❌ Failed to create tables:', errorMessage)
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: 'Check Vercel function logs for more information',
        hint: 'Try using migrations instead. See payload-cms/MIGRATIONS.md',
      },
      { status: 500 }
    )
  }
}
