/**
 * API endpoint to test user creation and capture exact error
 * Visit: http://localhost:3001/api/test-create-user
 */

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    
    const testUser = {
      email: 'test@hobbyrider.io',
      password: 'test-password-123',
      name: 'Test User',
      role: 'admin' as const,
    }
    
    try {
      // Check if user already exists
      const existing = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: testUser.email,
          },
        },
        limit: 1,
      })
      
      if (existing.totalDocs > 0) {
        return NextResponse.json({ 
          success: true,
          message: 'Test user already exists',
          user: existing.docs[0],
        })
      }
      
      const createdUser = await payload.create({
        collection: 'users',
        data: testUser,
      })
      
      return NextResponse.json({ 
        success: true,
        message: 'Test user created successfully',
        user: {
          id: createdUser.id,
          email: createdUser.email,
          role: createdUser.role,
        },
      })
    } catch (createError: any) {
      return NextResponse.json({ 
        success: false,
        message: 'Failed to create test user',
        error: {
          message: createError.message,
          name: createError.name,
          code: (createError as any).code,
          detail: (createError as any).detail,
          hint: (createError as any).hint,
        },
        stack: process.env.NODE_ENV === 'development' ? createError.stack : undefined,
      }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      message: 'Failed to initialize PayloadCMS',
      error: {
        message: error?.message || String(error),
      },
    }, { status: 500 })
  }
}
