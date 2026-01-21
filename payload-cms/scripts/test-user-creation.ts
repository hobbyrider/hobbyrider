/**
 * Script to test user creation and capture exact error
 * This will help us see what's actually failing
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

async function testUserCreation() {
  console.log('🔄 Testing user creation...')
  console.log('')
  
  try {
    const payload = await getPayload({ config: configPromise })
    
    console.log('✅ PayloadCMS initialized')
    console.log('')
    
    const testUser = {
      email: 'test@hobbyrider.io',
      password: 'test-password-123',
      name: 'Test User',
      role: 'admin' as const,
    }
    
    console.log('📝 Attempting to create test user...')
    console.log(`   Email: ${testUser.email}`)
    console.log(`   Role: ${testUser.role}`)
    console.log('')
    
    try {
      const createdUser = await payload.create({
        collection: 'users',
        data: testUser,
      })
      
      console.log('✅ User created successfully!')
      console.log(`   ID: ${createdUser.id}`)
      console.log(`   Email: ${createdUser.email}`)
      console.log('')
      console.log('💡 Now you can delete this test user and create your admin user')
      
    } catch (createError: any) {
      console.error('❌ Failed to create user:')
      console.error('')
      console.error('Error message:', createError.message)
      console.error('')
      
      if (createError.stack) {
        console.error('Stack trace:')
        console.error(createError.stack)
        console.error('')
      }
      
      // Check if it's a database error
      if (createError.message?.includes('column') || createError.message?.includes('constraint')) {
        console.error('💡 This looks like a schema mismatch issue')
        console.error('   Check that the users table has all required columns')
      }
      
      if (createError.message?.includes('password') || createError.message?.includes('hash')) {
        console.error('💡 This looks like a password hashing issue')
        console.error('   Check that PAYLOAD_SECRET is set correctly')
      }
      
      process.exit(1)
    }
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Failed to initialize PayloadCMS:', error?.message || String(error))
    process.exit(1)
  }
}

testUserCreation()
