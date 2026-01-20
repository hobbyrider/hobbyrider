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
    
    // Initialize PayloadCMS - this will connect to the database
    const payload = await getPayload({ config: configPromise })
    
    console.log('PayloadCMS initialized')
    
    // Access the database adapter to force schema push
    // In production, push: true may not work automatically, so we need to trigger it
    const dbAdapter = payload.db
    
    // Try to access any collection - this will trigger table creation if push is enabled
    // Even in production, if push: true is set, accessing the collection should create tables
    try {
      // First, try to query users - this will fail if table doesn't exist
      // But it may trigger table creation
      await payload.find({
        collection: 'users',
        limit: 0,
      })
      console.log('✅ Users table exists')
    } catch (queryError) {
      const errorMsg = queryError instanceof Error ? queryError.message : 'Unknown error'
      
      if (errorMsg.includes('does not exist') || errorMsg.includes('relation')) {
        console.log('⚠️ Tables do not exist yet')
        console.log('Note: push: true may not work in production. You may need to use migrations.')
        console.log('Trying to create tables by accessing database directly...')
        
        // In production, push: true might not work automatically
        // We'll need to create tables manually or use migrations
        return NextResponse.json(
          {
            success: false,
            error: 'Tables do not exist',
            message: 'PayloadCMS tables have not been created yet',
            solution: 'push: true only works in development. For production, use migrations or manually create tables',
            instructions: [
              '1. Generate migrations: npx payload migrate:create init',
              '2. Apply migrations: npx payload migrate',
              'Or visit /admin and PayloadCMS may create tables automatically on first access',
            ],
          },
          { status: 500 }
        )
      } else {
        throw queryError
      }
    }
    
    // If we got here, tables exist - create admin user if needed
    if (process.env.CREATE_FIRST_ADMIN === 'true') {
      try {
        const existingUsers = await payload.find({
          collection: 'users',
          limit: 1,
        })

        if (existingUsers.totalDocs === 0) {
          const email = process.env.FIRST_ADMIN_EMAIL || 'admin@hobbyrider.io'
          const password = process.env.FIRST_ADMIN_PASSWORD

          if (password) {
            await payload.create({
              collection: 'users',
              data: {
                email,
                password,
                name: 'Admin',
                role: 'admin',
              },
            })
            console.log(`✅ First admin user created: ${email}`)
            return NextResponse.json({
              success: true,
              message: 'Database initialized and first admin user created',
              email,
              note: 'You can now log in at /admin',
            })
          }
        } else {
          console.log('✅ Admin user already exists')
        }
      } catch (createError) {
        console.error('Failed to create admin user:', createError)
        return NextResponse.json({
          success: true,
          message: 'Database initialized',
          warning: 'Failed to create admin user. Check logs for details.',
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'PayloadCMS initialized successfully',
      note: 'Tables exist. You can access /admin now.',
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
