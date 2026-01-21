/**
 * Drop manually created PayloadCMS tables
 * Let PayloadCMS create them with the correct schema
 */

import { Pool } from 'pg'
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function dropManualTables() {
  console.log('🔄 Dropping manually created PayloadCMS tables...')
  console.log('')
  
  const client = await pool.connect()
  
  try {
    // Drop tables in reverse order of dependencies
    const tables = [
      'users_sessions',
      'blog_posts',
      'pages',
      'media',
      'users',
      '_payload_migrations',
    ]
    
    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`)
        console.log(`✅ Dropped table: ${table}`)
      } catch (error: any) {
        console.log(`⚠️  Could not drop ${table}: ${error.message}`)
      }
    }
    
    console.log('')
    console.log('✅ All manual PayloadCMS tables dropped!')
    console.log('')
    console.log('💡 The seed table (_payload_seed) is still there')
    console.log('   This allows Drizzle introspection to work')
    console.log('')
    console.log('💡 Now restart the dev server:')
    console.log('   npm run dev')
    console.log('')
    console.log('⚠️  PayloadCMS should now create tables with the correct schema')
    console.log('   If you still get errors, the empty database bug persists')
    
    client.release()
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to drop tables:', error)
    client.release()
    await pool.end()
    process.exit(1)
  }
}

dropManualTables()
