# Complete Setup Steps for PayloadCMS

## Step 1: Generate and Apply Migrations (Run This Locally)

You need to run this locally because it needs to connect to your production database.

### Quick One-Liner

```bash
cd payload-cms && DATABASE_URL=your_production_database_url npm run migrate:create init && DATABASE_URL=your_production_database_url npm run migrate
```

### Or Use the Setup Script

```bash
cd payload-cms
export DATABASE_URL=your_production_database_url
./scripts/setup-database.sh
```

**Replace `your_production_database_url` with your actual DATABASE_URL from Vercel.**

### Or Step-by-Step

1. **Get your DATABASE_URL from Vercel:**
   - Go to Vercel → hobbyrider-payload project → Settings → Environment Variables
   - Copy the `DATABASE_URL` value

2. **Run locally:**
   ```bash
   cd payload-cms
   DATABASE_URL=your_database_url npm run migrate:create init
   DATABASE_URL=your_database_url npm run migrate
   ```

3. **Commit the migration files:**
   ```bash
   git add payload-cms/migrations/
   git commit -m "Add initial PayloadCMS migration"
   git push origin main
   ```

## Step 2: Set Environment Variables in Vercel

Go to Vercel → hobbyrider-payload project → Settings → Environment Variables and add:

**Required:**
- `PAYLOAD_PUBLIC_SERVER_URL=https://payload.hobbyrider.io`
- `PAYLOAD_SECRET=your_payload_secret`
- `DATABASE_URL=your_database_url` (should already be set)

**For first admin user:**
- `CREATE_FIRST_ADMIN=true`
- `FIRST_ADMIN_EMAIL=your-email@example.com`
- `FIRST_ADMIN_PASSWORD=your-secure-password`

**Remove this if you added it temporarily:**
- `NODE_ENV=development` (remove this after tables are created)

## Step 3: Create First Admin User

After migrations are applied and you've set the environment variables:

1. **Option A: Via API route**
   Visit: `https://payload.hobbyrider.io/api/init-db`
   (This will create the first admin user automatically)

2. **Option B: Via admin UI**
   Visit: `https://payload.hobbyrider.io/admin`
   (You can create the first user via the UI)

3. **Option C: Automatic on next deployment**
   If you set `CREATE_FIRST_ADMIN=true`, the user will be created automatically on the next deployment.

## Step 4: Verify

1. Visit `https://payload.hobbyrider.io/admin`
2. You should see PayloadCMS's login page (not the main app's login)
3. Log in with your admin credentials

## Troubleshooting

- **Still seeing "relation users does not exist"**: Migrations weren't applied. Re-run `npm run migrate` with DATABASE_URL set.
- **Seeing main app's login**: Domain might not be assigned to the correct Vercel project. Check domain assignment.
- **Admin user not created**: Check Vercel logs for errors. Ensure `FIRST_ADMIN_PASSWORD` is set correctly.
