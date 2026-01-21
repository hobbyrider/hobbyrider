/**
 * Script to create a seed table to work around PayloadCMS empty database bug
 * This creates a simple table to "warm up" the database so Drizzle introspection works
 * 
 * Run: tsx scripts/create-seed-table.ts
 * Or: npm run create-seed-table
 */

import { Pool } from 'pg'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

async function createSeedTable() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required')
    process.exit(1)
  }

  console.log('🔄 Creating seed table to work around PayloadCMS empty database bug...')

  const pool = new Pool({
    connectionString: databaseUrl,
  })

  try {
    const client = await pool.connect()
    
    console.log('✅ Connected to database')

    // Create a simple seed table
    // This will "warm up" the database so Drizzle introspection works
    await client.query(`
      CREATE TABLE IF NOT EXISTS _payload_seed (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    console.log('✅ Seed table created: _payload_seed')

    // Verify it exists
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = '_payload_seed';
    `)

    if (result.rows.length > 0) {
      console.log('✅ Seed table verified in database')
      console.log('')
      console.log('💡 Now try starting PayloadCMS again:')
      console.log('   npm run dev')
      console.log('')
      console.log('📝 The seed table can be deleted after PayloadCMS creates its tables')
    } else {
      console.log('⚠️  Seed table might not have been created properly')
    }

    client.release()
    await pool.end()
    
    console.log('✅ Done!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to create seed table:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('permission denied')) {
        console.error('')
        console.error('⚠️  Database user does not have permission to create tables')
        console.error('   Please check your DATABASE_URL and database user permissions')
      } else if (error.message.includes('connect')) {
        console.error('')
        console.error('⚠️  Could not connect to database')
        console.error('   Please check your DATABASE_URL is correct')
      }
    }
    
    await pool.end()
    process.exit(1)
  }
}

createSeedTable()
