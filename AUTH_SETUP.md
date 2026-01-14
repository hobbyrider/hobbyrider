# Authentication Setup Guide

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# NextAuth.js (REQUIRED)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database (already configured)
DATABASE_URL=your_postgresql_connection_string
```

## Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and add it to your `.env.local` file as `NEXTAUTH_SECRET`.

## Features Implemented

✅ **User Registration & Login**
- Sign up with email, password, and username
- Login with email and password
- Password hashing with bcrypt

✅ **Session Management**
- JWT-based sessions
- Persistent login state
- Secure session handling

✅ **User Profiles**
- User profile pages at `/user/[username]` or `/user/[id]`
- Shows all products submitted by user
- User stats (total products, upvotes)

✅ **Protected Actions**
- Product submission requires authentication
- Comments require authentication
- User info automatically attached to submissions

✅ **Backward Compatibility**
- Old products with `maker` string still work
- New products use `makerId` relation
- Both old and new maker links supported

## Migration Notes

- Existing products keep their `maker` string field
- New products automatically link to authenticated user
- Comments can be from authenticated users or legacy string authors
- Maker profile pages work with both old usernames and new user accounts

## User Flow

1. **Sign Up**: `/signup` - Create account with email, username, password
2. **Login**: `/login` - Sign in with email and password
3. **Submit Product**: Requires login, automatically uses your account
4. **Comment**: Requires login, automatically uses your account
5. **Profile**: View your profile at `/user/[username]`

## Next Steps

After authentication, you can now build:
- Collections/Bookmarks (users can save products)
- Following System (users can follow each other)
- Badges & Achievements (user-specific features)
- Advanced user features
