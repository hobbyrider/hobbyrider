// Script to create the first admin user for PayloadCMS
// Run: npx tsx scripts/create-admin.ts

import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function createAdmin() {
  try {
    const email = process.env.FIRST_ADMIN_EMAIL || process.argv[2] || 'admin@hobbyrider.io'
    const password = process.env.FIRST_ADMIN_PASSWORD || process.argv[3]

    if (!password) {
      console.error('❌ Error: Password is required')
      console.log('Usage: npx tsx scripts/create-admin.ts <email> <password>')
      console.log('Or set FIRST_ADMIN_EMAIL and FIRST_ADMIN_PASSWORD env vars')
      process.exit(1)
    }

    console.log('Initializing PayloadCMS...')
    const payload = await getPayload({ config: configPromise })

    // Check if user already exists
    const existing = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      console.log(`✅ User ${email} already exists`)
      process.exit(0)
    }

    // Create admin user
    await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        name: 'Admin',
        role: 'admin',
      },
    })

    console.log(`✅ Admin user created successfully!`)
    console.log(`   Email: ${email}`)
    console.log(`   Role: admin`)
    console.log(`\n   You can now log in at: https://payload.hobbyrider.io/admin`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to create admin user:', error)
    process.exit(1)
  }
}

createAdmin()
