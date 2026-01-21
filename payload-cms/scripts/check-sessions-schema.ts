/**
 * Script to check users_sessions table schema
 */

import { Pool } from 'pg'
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function checkSessionsSchema() {
  const client = await pool.connect()
  
  try {
    const result = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'users_sessions'
      ORDER BY ordinal_position;
    `)
    
    console.log('📊 users_sessions table columns:')
    result.rows.forEach((col: any) => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
    client.release()
    await pool.end()
  } catch (error) {
    console.error('Error:', error)
    client.release()
    await pool.end()
  }
}

checkSessionsSchema()
