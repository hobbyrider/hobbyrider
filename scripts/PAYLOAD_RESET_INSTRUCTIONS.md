# Payload CMS Password Reset - Step by Step

## Quick Setup Instructions

### Step 1: Clone Your Payload Repository

```bash
# Navigate to a directory where you have write permissions
cd ~/Desktop  # or any directory you prefer

# Clone the repository
git clone https://github.com/hobbyrider/payload-website-starter.git

# Enter the directory
cd payload-website-starter
```

### Step 2: Set Up Environment Variables

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Login to Vercel (if not already logged in)
vercel login

# Link to your project (will prompt you to select the project)
vercel link

# Pull environment variables from Vercel
vercel env pull .env.local
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Copy the Reset Script

```bash
# Copy the reset script from your ph-clone project
cp /Users/evaldasbieliunas/ph-clone/scripts/payload-reset-user-standalone.ts scripts/reset-user.ts

# Or create it manually - the content is in the file above
```

### Step 5: Run the Reset Script

```bash
# Replace with your desired email and password
npx tsx scripts/reset-user.ts admin@hobbyrider.io YourNewPassword123!
```

### Step 6: Login

1. Visit `https://payload.hobbyrider.io/admin`
2. Login with the email and password you just set

## Alternative: Quick One-Liner Setup

If you want to do it all at once:

```bash
# Clone, setup, and run (replace email/password)
cd ~/Desktop && \
git clone https://github.com/hobbyrider/payload-website-starter.git && \
cd payload-website-starter && \
npm i -g vercel && \
vercel link && \
vercel env pull .env.local && \
npm install && \
cp /Users/evaldasbieliunas/ph-clone/scripts/payload-reset-user-standalone.ts scripts/reset-user.ts && \
npx tsx scripts/reset-user.ts admin@hobbyrider.io YourNewPassword123!
```

## Troubleshooting

### "Cannot find module 'payload'"
- Make sure you're in the `payload-website-starter` directory
- Run `npm install` to install dependencies

### "Database connection failed"
- Verify your `.env.local` has the correct `DATABASE_URL`
- Check that `vercel env pull` completed successfully
- Ensure the database is accessible

### "Operation not permitted" when cloning
- Try cloning to a different directory (Desktop, Documents, etc.)
- Or clone manually using GitHub Desktop or another Git client

### "Vercel CLI not found"
- Install it: `npm i -g vercel`
- Or use `npx vercel` instead of `vercel`

## What the Script Does

1. **Checks if user exists**: Looks for a user with the provided email
2. **Updates password**: If user exists, updates their password
3. **Creates new admin**: If no user exists, creates a new admin user
4. **Provides login info**: Shows you the email and password to use

## Security Notes

- The password is passed as a command-line argument (visible in process list)
- For production, consider using environment variables instead
- After resetting, consider setting up proper password reset emails in Payload

## Next Steps After Reset

1. ✅ Login and verify access
2. Configure email settings for password resets (optional)
3. Set up additional admin users if needed
4. Configure your collections and content
