// API route to initialize PayloadCMS database tables
// Call this once after deployment to create PayloadCMS tables
// GET /api/init-db?token=YOUR_PAYLOAD_INIT_TOKEN

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
    console.log('Initializing PayloadCMS database tables...')
    
    const payload = await getPayload({ config: configPromise })
    
    // Push schema to database (creates tables if they don't exist)
    await payload.db.push({
      force: false, // Don't force - only create if missing
    })
    
    console.log('✅ PayloadCMS database tables created successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'PayloadCMS database tables initialized successfully',
      note: 'You can now access /admin to create your first user',
    })
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: 'Check Vercel function logs for more information',
      },
      { status: 500 }
    )
  }
}
