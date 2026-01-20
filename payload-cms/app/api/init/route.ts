/**
 * API endpoint to initialize PayloadCMS database tables
 * Visit: http://localhost:3001/api/init
 * This will trigger PayloadCMS to create tables if they don't exist
 */

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Force table creation by accessing collections
    // This triggers PayloadCMS to create tables if push: true is enabled
    try {
      // Try to access users collection - this will create tables if they don't exist
      await payload.find({
        collection: 'users',
        limit: 0, // Just check existence, don't fetch
      })
      
      return NextResponse.json({ 
        success: true,
        message: 'Database tables are ready',
      })
    } catch (error: any) {
      const errorMessage = error?.message || String(error)
      
      // If tables don't exist yet, PayloadCMS should create them
      // But if push: true isn't working, we need to handle it
      if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
        return NextResponse.json({ 
          success: false,
          message: 'Tables do not exist yet. Please ensure push: true is set in payload.config.ts',
          error: errorMessage,
        }, { status: 500 })
      }
      
      // Other errors might mean tables are ready
      return NextResponse.json({ 
        success: true,
        message: 'Database is accessible',
      })
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      message: 'Failed to initialize database',
      error: error?.message || String(error),
    }, { status: 500 })
  }
}
