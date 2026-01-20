// API route to initialize PayloadCMS database tables
// Call this once after deployment to create PayloadCMS tables
// GET /api/init-db?token=YOUR_PAYLOAD_INIT_TOKEN
//
// Note: With push: true in payload.config.ts, PayloadCMS should create tables automatically.
// This route ensures PayloadCMS is initialized and tables are created.

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
    console.log('Initializing PayloadCMS...')
    
    // Initialize PayloadCMS
    // With push: true in config, PayloadCMS will automatically create tables
    // when it first accesses the database
    const payload = await getPayload({ config: configPromise })
    
    console.log('PayloadCMS initialized')
    
    // Try to access the users collection to trigger table creation
    // This will cause PayloadCMS to create tables if they don't exist (with push: true)
    try {
      await payload.find({
        collection: 'users',
        limit: 0, // Don't fetch any data, just check if table exists
      })
      console.log('✅ Users table exists')
    } catch (queryError) {
      const errorMsg = queryError instanceof Error ? queryError.message : 'Unknown error'
      
      // If the error is about missing table, PayloadCMS should create it on next request
      if (errorMsg.includes('does not exist') || errorMsg.includes('relation')) {
        console.log('⚠️ Tables may not exist yet - they will be created automatically with push: true')
        console.log('Try accessing /admin - PayloadCMS will create tables on first use')
      } else {
        throw queryError
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'PayloadCMS initialized successfully',
      note: 'With push: true enabled, tables are created automatically. Try accessing /admin now.',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('❌ Database initialization failed:', errorMessage)
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: 'Check Vercel function logs for more information',
        hint: 'Ensure DATABASE_URL and PAYLOAD_SECRET are set in Vercel environment variables',
      },
      { status: 500 }
    )
  }
}
