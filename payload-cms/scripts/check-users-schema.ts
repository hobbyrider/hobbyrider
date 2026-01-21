/**
 * Script to check users table schema and compare with PayloadCMS expectations
 */

import { Pool } from 'pg'
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function checkUsersSchema() {
  console.log('🔍 Checking users table schema...')
  console.log('')
  
  const client = await pool.connect()
  
  try {
    // Get table structure
    const columnsResult = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      ORDER BY ordinal_position;
    `)
    
    console.log('📊 Users table columns:')
    console.log('')
    columnsResult.rows.forEach((col: any) => {
      console.log(`  ${col.column_name}:`)
      console.log(`    Type: ${col.data_type}`)
      console.log(`    Nullable: ${col.is_nullable}`)
      console.log(`    Default: ${col.column_default || 'none'}`)
      console.log('')
    })
    
    // Get constraints
    const constraintsResult = await client.query(`
      SELECT 
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'public' 
      AND table_name = 'users';
    `)
    
    console.log('🔒 Constraints:')
    constraintsResult.rows.forEach((constraint: any) => {
      console.log(`  ${constraint.constraint_name}: ${constraint.constraint_type}`)
    })
    console.log('')
    
    // Get indexes
    const indexesResult = await client.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public' 
      AND tablename = 'users';
    `)
    
    console.log('📇 Indexes:')
    if (indexesResult.rows.length > 0) {
      indexesResult.rows.forEach((idx: any) => {
        console.log(`  ${idx.indexname}`)
      })
    } else {
      console.log('  (no indexes)')
    }
    console.log('')
    
    console.log('💡 PayloadCMS expects these auth fields:')
    console.log('  - password (required, TEXT)')
    console.log('  - email (required, unique, TEXT)')
    console.log('  - salt (optional, TEXT)')
    console.log('  - hash (optional, TEXT)')
    console.log('  - reset_password_token (optional, TEXT)')
    console.log('  - reset_password_expiration (optional, TIMESTAMP)')
    console.log('  - login_attempts (optional, INTEGER)')
    console.log('  - lock_until (optional, TIMESTAMP)')
    console.log('')
    
    client.release()
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to check schema:', error)
    client.release()
    await pool.end()
    process.exit(1)
  }
}

checkUsersSchema()
