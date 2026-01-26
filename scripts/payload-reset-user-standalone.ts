/**
 * Payload CMS Admin User Reset Script
 * 
 * Copy this file to your payload-website-starter repository:
 *   cp scripts/payload-reset-user-standalone.ts /path/to/payload-website-starter/scripts/reset-user.ts
 * 
 * Usage:
 *   1. Clone your Payload repo: git clone https://github.com/hobbyrider/payload-website-starter.git
 *   2. cd payload-website-starter
 *   3. Pull env vars: vercel env pull .env.local
 *   4. Install deps: npm install
 *   5. Run: npx tsx scripts/reset-user.ts admin@hobbyrider.io your-new-password
 */

import 'dotenv/config'

async function resetUser() {
  try {
    // Dynamic import to ensure Payload is available
    const { getPayload } = await import('payload')
    // Payload config is in src/payload.config.ts for website-starter template
    const configModule = await import('../src/payload.config')
    const configPromise = configModule.default || configModule

    const payload = await getPayload({ config: configPromise })
    
    // Get email and password from command line args
    const email = process.argv[2]
    const password = process.argv[3]

    if (!email || !password) {
      console.error('❌ Usage: npx tsx scripts/reset-user.ts <email> <password>')
      console.error('   Example: npx tsx scripts/reset-user.ts admin@hobbyrider.io MyNewPassword123!')
      process.exit(1)
    }

    console.log(`\n🔍 Checking for user: ${email}`)

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
      // Update existing user's password
      const user = existingUsers.docs[0]
      console.log(`📝 Found existing user. Updating password...`)
      
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          password,
        },
      })
      
      console.log('✅ Password updated successfully!')
      console.log(`   Email: ${email}`)
      console.log(`   Role: ${user.role || 'admin'}`)
    } else {
      // Create new admin user
      console.log(`➕ No user found. Creating new admin user...`)
      
      const user = await payload.create({
        collection: 'users',
        data: {
          email,
          password,
          role: 'admin',
        },
      })
      
      console.log('✅ Admin user created successfully!')
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   ID: ${user.id}`)
    }
    
    console.log(`\n🔗 Login at: https://payload.hobbyrider.io/admin`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}\n`)
    
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Error resetting user:')
    console.error(`   ${error.message}`)
    
    if (error.message?.includes('Cannot find module')) {
      console.error('\n💡 Make sure you:')
      console.error('   1. Are in the payload-website-starter directory')
      console.error('   2. Have run: npm install')
      console.error('   3. Have pulled env vars: vercel env pull .env.local')
    }
    
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    
    process.exit(1)
  }
}

resetUser()
