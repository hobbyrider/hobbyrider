# PayloadCMS Authentication Setup

## Current Status

PayloadCMS has **basic email/password authentication** configured. It does **NOT** use the main app's NextAuth system.

## Important Notes

1. **Separate Auth Systems**: PayloadCMS (`payload.hobbyrider.io`) and the main app (`hobbyrider.io`) have separate authentication systems:
   - Main app uses NextAuth with Google OAuth
   - PayloadCMS uses its own built-in auth (email/password only)

2. **Google OAuth in PayloadCMS**: If you want Google OAuth in PayloadCMS admin, you need to:
   - Install `payload-auth-plugin` package
   - Configure Google OAuth provider
   - Set up OAuth credentials with redirect URI: `https://payload.hobbyrider.io/api/auth/oauth/callback/google`

## Environment Variables Required

For the `hobbyrider-payload` Vercel project, set:

```
PAYLOAD_PUBLIC_SERVER_URL=https://payload.hobbyrider.io
PAYLOAD_SECRET=your_payload_secret
DATABASE_URL=your_database_url
```

**Do NOT** set `NEXTAUTH_URL` or `NEXTAUTH_SECRET` in the PayloadCMS project - those are for the main app only.

## Accessing Admin

1. Visit `https://payload.hobbyrider.io/admin`
2. You'll see PayloadCMS's own login page (NOT the main app's login)
3. Create your first admin user via the PayloadCMS interface
4. Use email/password to log in

## Troubleshooting

### Redirecting to main app login

If you're being redirected to `hobbyrider.io/login`:
- Check that `PAYLOAD_PUBLIC_SERVER_URL=https://payload.hobbyrider.io` is set in Vercel
- Verify the `serverURL` in `payload.config.ts` matches your subdomain

### 404 on /api/init-db

The route should work. If you get 404:
- Ensure you're accessing `https://payload.hobbyrider.io/api/init-db` (not the main app)
- Check Vercel function logs for routing errors
