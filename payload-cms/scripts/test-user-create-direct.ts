/**
 * Direct script to test user creation and see exact error
 */

// Load environment variables FIRST, before any other imports
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })

// Now import after env vars are loaded
import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function testUserCreate() {
  try {
    console.log('🔧 Initializing PayloadCMS...')
    const payload = await getPayload({ config: configPromise })
    
    const testUser = {
      email: process.env.FIRST_ADMIN_EMAIL || 'test@hobbyrider.io',
      password: process.env.FIRST_ADMIN_PASSWORD || 'test-password-123',
      name: 'Test Admin',
      role: 'admin' as const,
    }
    
    console.log('📝 Attempting to create user:', testUser.email)
    console.log('')
    
    try {
      const createdUser = await payload.create({
        collection: 'users',
        data: testUser,
      })
      
      console.log('✅ User created successfully!')
      console.log('')
      console.log('User details:')
      console.log(`  ID: ${createdUser.id}`)
      console.log(`  Email: ${createdUser.email}`)
      console.log(`  Name: ${createdUser.name}`)
      console.log(`  Role: ${createdUser.role}`)
      
      process.exit(0)
    } catch (createError: any) {
      console.error('❌ Failed to create user')
      console.error('')
      console.error('Error details:')
      console.error(`  Message: ${createError.message}`)
      console.error(`  Name: ${createError.name}`)
      console.error(`  Code: ${createError.code || 'N/A'}`)
      
      if (createError.detail) {
        console.error(`  Detail: ${createError.detail}`)
      }
      
      if (createError.hint) {
        console.error(`  Hint: ${createError.hint}`)
      }
      
      if (createError.constraint) {
        console.error(`  Constraint: ${createError.constraint}`)
      }
      
      if (createError.table) {
        console.error(`  Table: ${createError.table}`)
      }
      
      if (createError.column) {
        console.error(`  Column: ${createError.column}`)
      }
      
      if (createError.sql) {
        console.error('')
        console.error('SQL Query:')
        console.error(createError.sql)
      }
      
      if (createError.params) {
        console.error('')
        console.error('SQL Params:')
        console.error(createError.params)
      }
      
      console.error('')
      console.error('Full error stack:')
      console.error(createError.stack)
      
      process.exit(1)
    }
  } catch (error: any) {
    console.error('❌ Failed to initialize PayloadCMS')
    console.error('')
    console.error('Error:', error.message)
    console.error('')
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

testUserCreate()
