# NextAuth Authentication Error Fix

## Errors Fixed
- `ClientFetchError: Failed to fetch` from AuthJS
- Network errors when trying to authenticate

## Changes Made

### 1. SessionProvider Configuration
Updated `app/components/auth-provider.tsx`:
- Added explicit `basePath="/api/auth"` to ensure correct API route
- Added `refetchInterval` and `refetchOnWindowFocus` for better session management

### 2. NextAuth Configuration
Updated `lib/auth.ts`:
- Added `trustHost: true` - Required for NextAuth v5 in development
- Added `debug: true` in development mode for better error logging
- Extended session `maxAge` to 30 days

## Required Environment Variables

Make sure you have these in your `.env.local`:

```bash
# Required for NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Or use AUTH_SECRET (NextAuth v5 alternative)
AUTH_SECRET=your-secret-key-here
```

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

## Troubleshooting

### If errors persist:

1. **Check environment variables:**
   ```bash
   # Make sure .env.local exists and has NEXTAUTH_SECRET
   cat .env.local | grep NEXTAUTH
   ```

2. **Restart development server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Clear browser cache and cookies:**
   - Clear cookies for localhost:3000
   - Try incognito/private mode

4. **Check API route is accessible:**
   - Visit: http://localhost:3000/api/auth/providers
   - Should return JSON with available providers

5. **Check browser console:**
   - Look for specific error messages
   - Check Network tab for failed requests to `/api/auth/*`

## NextAuth v5 Notes

NextAuth v5 (beta) requires:
- `trustHost: true` in development
- Proper `basePath` in SessionProvider
- Either `NEXTAUTH_SECRET` or `AUTH_SECRET` environment variable

## Verification

After fixing, you should be able to:
- ✅ Visit `/login` without errors
- ✅ See authentication providers (if configured)
- ✅ Sign in without network errors
- ✅ Session persists across page refreshes
