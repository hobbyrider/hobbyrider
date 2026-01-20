# Quick Fix: Create PayloadCMS Tables

Since `push: true` isn't working reliably on Vercel, use migrations to create tables.

## Option 1: Run Migrations Locally (Easiest)

1. **Clone the repo locally** (if not already)

2. **Install dependencies:**
   ```bash
   cd payload-cms
   npm install
   ```

3. **Generate initial migration:**
   ```bash
   DATABASE_URL=your_production_database_url npm run migrate:create init
   ```
   This creates migration files in `payload-cms/migrations/` directory.

4. **Apply migrations to create tables:**
   ```bash
   DATABASE_URL=your_production_database_url npm run migrate
   ```

5. **Commit and push the migration files:**
   ```bash
   git add payload-cms/migrations/
   git commit -m "Add initial PayloadCMS migration"
   git push origin main
   ```

6. **Create first admin user** - Set in Vercel:
   ```
   CREATE_FIRST_ADMIN=true
   FIRST_ADMIN_EMAIL=your-email@example.com
   FIRST_ADMIN_PASSWORD=your-password
   ```
   Then visit `/api/init-db` or `/admin` - the user will be created automatically.

## Option 2: Manual SQL (If migrations don't work)

If you have database access, you can manually create the tables. But migrations are safer and recommended.

## Option 3: Use Vercel CLI (Alternative)

If you have Vercel CLI installed:

```bash
cd payload-cms
vercel env pull .env.local
DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2-)
npm run migrate:create init
npm run migrate
```

## After Tables Are Created

1. Remove `NODE_ENV=development` from Vercel (if you added it)
2. Set `CREATE_FIRST_ADMIN=true` and credentials in Vercel
3. Visit `https://payload.hobbyrider.io/admin` - you should see the PayloadCMS login page
4. Log in with your admin credentials
