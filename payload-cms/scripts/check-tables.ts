import { Pool } from 'pg'
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()

const result = await client.query(`
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name LIKE '%users%' OR table_name LIKE '%blog%' OR table_name LIKE '%page%' OR table_name LIKE '%media%' OR table_name LIKE '%payload%'
  ORDER BY table_name;
`)

console.log('Tables found:', result.rows.map(r => r.table_name))
client.release()
await pool.end()
