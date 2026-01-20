# NextAuth "Bad Request" Error Fix

## Error
`http://localhost:3000/api/auth/*: "Bad request."`

## Common Causes

1. **Missing NEXTAUTH_SECRET** - Most common cause
2. **CSRF token validation** - NextAuth v5 strict validation
3. **Invalid request format** - Missing required parameters
4. **Cookie configuration** - Secure cookie issues in development

## Fixes Applied

### 1. Route Handler Configuration
Updated `app/api/auth/[...nextauth]/route.ts`:
- Added `runtime = "nodejs"` for proper server execution
- Added `dynamic = "force-dynamic"` for Next.js 16 compatibility

### 2. Cookie Configuration
Updated `lib/auth.ts`:
- Added explicit cookie configuration
- Set `useSecureCookies` based on environment
- Configured session token cookie with proper settings

## Required Environment Variables

**Critical:** Make sure `.env.local` has:

```bash
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

## Troubleshooting Steps

### 1. Verify Environment Variables
```bash
# Check if secret exists
cat .env.local | grep NEXTAUTH_SECRET

# If missing, generate and add:
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
```

### 2. Restart Development Server
```bash
# Stop server (Ctrl+C)
# Clear .next cache
rm -rf .next
# Restart
npm run dev
```

### 3. Clear Browser Data
- Clear cookies for `localhost:3000`
- Clear browser cache
- Try incognito/private mode

### 4. Test Specific Endpoints
```bash
# Test providers endpoint (should work)
curl http://localhost:3000/api/auth/providers

# Test session endpoint (may require authentication)
curl http://localhost:3000/api/auth/session
```

### 5. Check Server Logs
Look for specific error messages in:
- Terminal/console where `npm run dev` is running
- Browser console (F12 → Console tab)
- Network tab (F12 → Network → check failed requests)

## Common Error Patterns

### "Bad request" on signin
- **Cause:** Missing CSRF token or invalid request
- **Fix:** Ensure form includes CSRF token (NextAuth handles this automatically)

### "Bad request" on callback
- **Cause:** Invalid callback URL or OAuth state mismatch
- **Fix:** Verify `NEXTAUTH_URL` matches your actual URL

### "Bad request" on session
- **Cause:** Invalid or expired session token
- **Fix:** Clear cookies and sign in again

## Verification

After applying fixes:

1. ✅ `/api/auth/providers` returns JSON (already working)
2. ✅ `/api/auth/session` returns session or `{}`
3. ✅ `/login` page loads without errors
4. ✅ Sign in works without "Bad request" errors

## NextAuth v5 Notes

NextAuth v5 (beta) has stricter validation:
- Requires `trustHost: true` in development (already added)
- Requires proper cookie configuration (now added)
- Requires `NEXTAUTH_SECRET` or `AUTH_SECRET` (verify this exists)

## Still Having Issues?

If "Bad request" persists:

1. Check terminal for detailed error messages
2. Verify database connection (Prisma adapter needs working DB)
3. Check if any middleware is interfering with `/api/auth/*` routes
4. Try accessing `/api/auth/providers` directly in browser (should work)
