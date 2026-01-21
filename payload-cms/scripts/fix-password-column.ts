/**
 * Script to fix password column - make it nullable since PayloadCMS 3.0 uses salt/hash
 */

import { Pool } from 'pg'
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function fixPasswordColumn() {
  console.log('🔧 Fixing password column...')
  console.log('')
  
  const client = await pool.connect()
  
  try {
    // Check current constraint
    const checkResult = await client.query(`
      SELECT 
        column_name,
        is_nullable,
        data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      AND column_name = 'password';
    `)
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Password column does not exist')
      client.release()
      await pool.end()
      process.exit(1)
    }
    
    const currentState = checkResult.rows[0]
    console.log(`Current password column state:`)
    console.log(`  Nullable: ${currentState.is_nullable}`)
    console.log(`  Type: ${currentState.data_type}`)
    console.log('')
    
    if (currentState.is_nullable === 'NO') {
      console.log('⚠️ Password column is NOT NULL, but PayloadCMS 3.0 uses salt/hash instead')
      console.log('Making password column nullable...')
      console.log('')
      
      await client.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;`)
      
      console.log('✅ Password column is now nullable')
    } else {
      console.log('✅ Password column is already nullable')
    }
    
    client.release()
    await pool.end()
    console.log('')
    console.log('🎉 Done! Try creating a user again.')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Failed to fix password column:', error.message)
    console.error('')
    console.error('Full error:', error)
    client.release()
    await pool.end()
    process.exit(1)
  }
}

fixPasswordColumn()
