# Creating the First Admin User in PayloadCMS

## Option 1: Automatic Creation (Recommended)

Set these environment variables in Vercel for the `hobbyrider-payload` project:

```
CREATE_FIRST_ADMIN=true
FIRST_ADMIN_EMAIL=your-email@example.com
FIRST_ADMIN_PASSWORD=your-secure-password
```

After deployment, the first admin user will be created automatically on first startup.

⚠️ **Important**: After the user is created, remove or set `CREATE_FIRST_ADMIN=false` to prevent accidental recreation.

## Option 2: Manual Creation via Script

1. Set environment variables in Vercel:
   ```
   FIRST_ADMIN_EMAIL=your-email@example.com
   FIRST_ADMIN_PASSWORD=your-secure-password
   ```

2. Access the Vercel function logs or use Vercel CLI to run:
   ```bash
   npm run create-admin
   ```

3. Or run locally (with DATABASE_URL set):
   ```bash
   cd payload-cms
   FIRST_ADMIN_EMAIL=admin@hobbyrider.io FIRST_ADMIN_PASSWORD=your-password npm run create-admin
   ```

## Option 3: Via API Route

You can also create an API route to create the admin user (for one-time use):

1. Visit `/api/create-admin` (you'll need to add this route if needed)
2. Or use the `/api/init-db` route which could also create the first user

## About the "Figma" Message

The message "We're joining Figma! During this transition, new signups are paused..." refers to PayloadCMS Cloud (their hosted service). It does **NOT** affect self-hosted PayloadCMS, which is what you're using. You can safely ignore this message.

## Accessing Admin After Creating User

1. Visit `https://payload.hobbyrider.io/admin`
2. Enter your email and password
3. You should be logged into PayloadCMS admin

## Troubleshooting

If you're still seeing the main app's login page instead of PayloadCMS admin:
1. Check that `PAYLOAD_PUBLIC_SERVER_URL=https://payload.hobbyrider.io` is set in Vercel
2. Ensure the PayloadCMS project is deployed separately (not as part of the main app)
3. Check Vercel function logs for any errors during PayloadCMS initialization
