/**
 * Debug endpoint to test user creation with detailed error logging
 */

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body
    
    const payload = await getPayload({ config: configPromise })
    
    try {
      const createdUser = await payload.create({
        collection: 'users',
        data: {
          email: email || 'test@hobbyrider.io',
          password: password || 'test-password-123',
          name: name || 'Test User',
          role: 'admin',
        },
      })
      
      return NextResponse.json({ 
        success: true,
        message: 'User created successfully',
        user: {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          role: createdUser.role,
        },
      })
    } catch (createError: any) {
      console.error('❌ User creation error:', createError)
      
      // Extract detailed error information
      const errorDetails: any = {
        message: createError.message,
        name: createError.name,
        code: createError.code,
        detail: createError.detail,
        hint: createError.hint,
        constraint: createError.constraint,
        table: createError.table,
        column: createError.column,
      }
      
      // If it's a database error, get more details
      if (createError.code) {
        errorDetails.pgCode = createError.code
        errorDetails.pgMessage = createError.message
      }
      
      // Check for SQL in the error
      if (createError.sql) {
        errorDetails.sql = createError.sql
      }
      
      // Check for parameters
      if (createError.params) {
        errorDetails.params = createError.params
      }
      
      return NextResponse.json({ 
        success: false,
        message: 'Failed to create user',
        error: errorDetails,
        stack: process.env.NODE_ENV === 'development' ? createError.stack : undefined,
      }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      message: 'Failed to initialize PayloadCMS',
      error: {
        message: error?.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'POST to this endpoint with { email, password, name } to test user creation',
    example: {
      email: 'test@hobbyrider.io',
      password: 'test-password-123',
      name: 'Test User',
    },
  })
}
