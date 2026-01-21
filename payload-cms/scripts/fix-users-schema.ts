/**
 * Comprehensive fix for users table schema to match PayloadCMS 3.0 expectations
 */

import { Pool } from 'pg'
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function fixUsersSchema() {
  console.log('🔧 Fixing users table schema for PayloadCMS 3.0...')
  console.log('')
  
  const client = await pool.connect()
  
  try {
    // 1. Make password nullable (PayloadCMS 3.0 uses salt/hash instead)
    console.log('1. Making password column nullable...')
    await client.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;`)
    console.log('   ✅ Password is now nullable')
    console.log('')
    
    // 2. Ensure salt and hash are nullable (they should be, but verify)
    console.log('2. Verifying salt and hash columns...')
    const saltCheck = await client.query(`
      SELECT is_nullable FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'salt';
    `)
    if (saltCheck.rows[0]?.is_nullable === 'NO') {
      await client.query(`ALTER TABLE "users" ALTER COLUMN "salt" DROP NOT NULL;`)
      console.log('   ✅ Made salt nullable')
    } else {
      console.log('   ✅ Salt is already nullable')
    }
    
    const hashCheck = await client.query(`
      SELECT is_nullable FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'hash';
    `)
    if (hashCheck.rows[0]?.is_nullable === 'NO') {
      await client.query(`ALTER TABLE "users" ALTER COLUMN "hash" DROP NOT NULL;`)
      console.log('   ✅ Made hash nullable')
    } else {
      console.log('   ✅ Hash is already nullable')
    }
    console.log('')
    
    // 3. Verify all required columns exist and are correct
    console.log('3. Verifying table structure...')
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position;
    `)
    
    const requiredColumns = ['id', 'email', 'name', 'role', 'salt', 'hash', 
                             'password', 'reset_password_token', 'reset_password_expiration',
                             'login_attempts', 'lock_until', 'created_at', 'updated_at']
    
    const existingColumns = columns.rows.map((r: any) => r.column_name)
    const missing = requiredColumns.filter(col => !existingColumns.includes(col))
    
    if (missing.length > 0) {
      console.log(`   ⚠️  Missing columns: ${missing.join(', ')}`)
    } else {
      console.log('   ✅ All required columns exist')
    }
    console.log('')
    
    // 4. Check constraints
    console.log('4. Checking constraints...')
    const constraints = await client.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'public' AND table_name = 'users';
    `)
    console.log(`   Found ${constraints.rows.length} constraints`)
    constraints.rows.forEach((c: any) => {
      console.log(`   - ${c.constraint_name}: ${c.constraint_type}`)
    })
    console.log('')
    
    console.log('✅ Schema fix complete!')
    console.log('')
    console.log('💡 Try creating a user again at http://localhost:3001/admin/create-first-user')
    
    client.release()
    await pool.end()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Failed to fix schema:', error.message)
    if (error.code) {
      console.error(`   Error code: ${error.code}`)
    }
    if (error.detail) {
      console.error(`   Detail: ${error.detail}`)
    }
    client.release()
    await pool.end()
    process.exit(1)
  }
}

fixUsersSchema()
