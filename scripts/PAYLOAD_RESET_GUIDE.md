# Payload CMS Password Reset Guide

## Quick Options

### Option 1: Check Registration Form (Easiest)
1. Visit `https://payload.hobbyrider.io/admin`
2. If you see a **registration form** (not just login), create your admin account there
3. Payload automatically shows registration when no users exist

### Option 2: Use Vercel CLI (Recommended)

#### Step 1: Install Vercel CLI (if not installed)
```bash
npm i -g vercel
```

#### Step 2: Clone Your Payload Project
The Payload instance is in a separate Vercel project. You need to:
1. Go to Vercel dashboard → `payload-website-starter` project
2. Click "Repository" to find the GitHub repo
3. Clone it locally:
```bash
git clone <your-payload-repo-url>
cd payload-website-starter
```

#### Step 3: Pull Environment Variables
```bash
vercel env pull .env.local
```

#### Step 4: Create/Reset User Script
Create a file `scripts/reset-user.ts` in the Payload project:

```typescript
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function resetUser() {
  const payload = await getPayload({ config: configPromise })
  
  const email = process.argv[2] || 'admin@hobbyrider.io'
  const password = process.argv[3] || 'your-new-password'
  
  // Check if user exists
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  })
  
  if (existing.totalDocs > 0) {
    // Update password
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: { password },
    })
    console.log('✅ Password updated!')
  } else {
    // Create new admin
    await payload.create({
      collection: 'users',
      data: { email, password, role: 'admin' },
    })
    console.log('✅ Admin user created!')
  }
}

resetUser()
```

#### Step 5: Run the Script
```bash
npx tsx scripts/reset-user.ts admin@hobbyrider.io your-new-password
```

### Option 3: Direct Database Access

If you have direct database access (via Prisma Studio or psql):

1. **Get Database URL from Vercel:**
   - Vercel Dashboard → `payload-website-starter` → Settings → Environment Variables
   - Copy `DATABASE_URL` or `POSTGRES_URL`

2. **Connect to Database:**
```bash
# Using psql
psql <DATABASE_URL>

# Or using Prisma Studio (if Payload uses Prisma)
npx prisma studio
```

3. **Reset Password Hash:**
   - Find the `users` table
   - Update the password hash (Payload uses bcrypt)
   - Or delete the user to trigger registration form

**Generate bcrypt hash:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 10).then(h => console.log(h))"
```

Then update in database:
```sql
UPDATE users SET password = '<bcrypt-hash>' WHERE email = 'admin@hobbyrider.io';
```

### Option 4: Use Payload API (If You Have Access)

If you can make API calls to the Payload instance:

```bash
# Create new user
curl -X POST https://payload.hobbyrider.io/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hobbyrider.io",
    "password": "your-new-password",
    "role": "admin"
  }'
```

**Note:** This only works if:
- No users exist (first user can be created via API)
- Or you have an API key configured

### Option 5: Redeploy with Seed Script

If you have access to the Payload project repository:

1. Add a seed script that creates an admin user
2. Run it during deployment or manually
3. Commit and redeploy

## Recommended Approach

**For Vercel deployment, Option 2 (Vercel CLI) is recommended** because:
- ✅ Uses Payload's built-in user management
- ✅ Properly hashes passwords
- ✅ Works with existing database
- ✅ No direct database access needed

## Troubleshooting

### "Users already exist" error
- Delete existing users from database, OR
- Use the update path in the script to reset password

### "Cannot find module 'payload'"
- Make sure you're in the Payload project directory
- Run `npm install` first

### "Database connection failed"
- Verify `DATABASE_URL` in `.env.local` matches Vercel env vars
- Check database is accessible from your IP

## Next Steps After Reset

1. Login at `https://payload.hobbyrider.io/admin`
2. Verify you can access the admin panel
3. Consider setting up:
   - Email configuration for password resets
   - Additional admin users
   - API keys if needed
