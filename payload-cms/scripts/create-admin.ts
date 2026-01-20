/**
 * Script to manually create an admin user
 * Usage: npm run create-admin
 * Or: tsx scripts/create-admin.ts
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function createAdmin() {
  const payload = await getPayload({ config: configPromise })

  const email = process.env.ADMIN_EMAIL || 'admin@hobbyrider.io'
  const password = process.env.ADMIN_PASSWORD

  if (!password) {
    console.error('❌ ADMIN_PASSWORD environment variable is required')
    console.error('Set it with: ADMIN_PASSWORD=your-password npm run create-admin')
    process.exit(1)
  }

  try {
    // Check if user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    if (existingUsers.totalDocs > 0) {
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

    console.log(`✅ Admin user created: ${email}`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to create admin user:', error)
    process.exit(1)
  }
}

createAdmin()
