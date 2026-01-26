/**
 * Quick test script to verify blog integration locally
 * Run: npx tsx scripts/test-blog-local.ts
 */

import 'dotenv/config'

async function testBlogIntegration() {
  console.log('🧪 Testing Blog Integration Locally\n')

  // 1. Check environment variable
  console.log('1. Checking environment variable...')
  const payloadUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL
  if (!payloadUrl) {
    console.error('❌ PAYLOAD_PUBLIC_SERVER_URL not set in .env.local')
    console.error('   Add: PAYLOAD_PUBLIC_SERVER_URL=https://payload.hobbyrider.io')
    process.exit(1)
  }
  console.log(`✅ Found: PAYLOAD_PUBLIC_SERVER_URL=${payloadUrl}\n`)

  // 2. Test API connection
  console.log('2. Testing Payload API connection...')
  try {
    const url = new URL(`${payloadUrl}/api/posts`)
    url.searchParams.set('where[_status][equals]', 'published')
    url.searchParams.set('limit', '1')

    const res = await fetch(url.toString())
    
    if (!res.ok) {
      console.error(`❌ API returned ${res.status} ${res.statusText}`)
      console.error('   Check CORS settings in Payload config')
      process.exit(1)
    }

    const data = await res.json()
    const postCount = data.totalDocs || 0
    
    if (postCount === 0) {
      console.warn('⚠️  No published posts found')
      console.warn('   Make sure you have at least one published post in Payload admin')
    } else {
      console.log(`✅ Found ${postCount} published post(s)`)
      if (data.docs && data.docs.length > 0) {
        console.log(`   Latest: "${data.docs[0].title}"`)
      }
    }
  } catch (error: any) {
    console.error('❌ Failed to connect to Payload API:')
    console.error(`   ${error.message}`)
    console.error('\n   Possible issues:')
    console.error('   - CORS not configured in Payload')
    console.error('   - Payload URL incorrect')
    console.error('   - Network/firewall blocking request')
    process.exit(1)
  }

  console.log('\n✅ All tests passed!')
  console.log('\n📝 Next steps:')
  console.log('   1. Visit http://localhost:3000/blog')
  console.log('   2. Check that posts appear')
  console.log('   3. Check that Blog link appears in navigation')
  console.log('   4. Add PAYLOAD_PUBLIC_SERVER_URL to Vercel env vars')
  console.log('   5. Deploy to production')
}

testBlogIntegration()
