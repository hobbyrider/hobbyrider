/**
 * Script to create or reset Payload CMS admin user
 * 
 * Usage:
 * 1. For Vercel deployment: Use Vercel CLI to run this script
 *    vercel env pull .env.local
 *    npx tsx scripts/payload-reset-user.ts <email> <password>
 * 
 * 2. Or set environment variables:
 *    PAYLOAD_USER_EMAIL=admin@example.com
 *    PAYLOAD_USER_PASSWORD=yourpassword
 *    npx tsx scripts/payload-reset-user.ts
 */

import 'dotenv/config'

// Get email and password from args or env
const email = process.argv[2] || process.env.PAYLOAD_USER_EMAIL
const password = process.argv[3] || process.env.PAYLOAD_USER_PASSWORD

if (!email || !password) {
  console.error('❌ Usage: npx tsx scripts/payload-reset-user.ts <email> <password>')
  console.error('   Or set PAYLOAD_USER_EMAIL and PAYLOAD_USER_PASSWORD env vars')
  process.exit(1)
}

// Note: This script needs to be run in the Payload project directory
// For Vercel deployment, you'll need to:
// 1. Clone the Payload project repo
// 2. Set DATABASE_URL and PAYLOAD_SECRET from Vercel env vars
// 3. Run this script

async function resetUser() {
  try {
    // Dynamic import to handle missing Payload in this repo
    const { getPayload } = await import('payload')
    const configPromise = await import('../payload.config').catch(() => null)
    
    if (!configPromise) {
      console.error('❌ Payload config not found. This script must be run in the Payload project directory.')
      console.error('   For Vercel deployment, clone the payload-website-starter repo first.')
      process.exit(1)
    }

    const payload = await getPayload({ config: configPromise.default || configPromise })
    
    // Check if user exists
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
      // Update existing user
      const user = existingUsers.docs[0]
      console.log(`📝 Updating existing user: ${email}`)
      
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          password,
        },
      })
      
      console.log('✅ Password updated successfully!')
      console.log(`Email: ${email}`)
    } else {
      // Create new user
      console.log(`➕ Creating new admin user: ${email}`)
      
      const user = await payload.create({
        collection: 'users',
        data: {
          email,
          password,
          role: 'admin',
        },
      })
      
      console.log('✅ Admin user created successfully!')
      console.log(`Email: ${user.email}`)
      console.log(`Role: ${user.role}`)
    }
    
    console.log(`\n🔗 Login at: https://payload.hobbyrider.io/admin`)
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

resetUser()
