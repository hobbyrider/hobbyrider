# PayloadCMS Environment Variables Guide

## Which Project Needs Which Variables?

### `hobbyrider` (Main App Project)

**Does NOT need PayloadCMS variables.** This project only needs:

- `DATABASE_URL` - ✅ (for your main app's database)
- `NEXTAUTH_SECRET` - ✅
- `NEXTAUTH_URL` - ✅
- `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` - ✅ (optional)
- Other main app variables (OAuth, email, etc.)

**Do NOT add:**
- ❌ `PAYLOAD_SECRET`
- ❌ `PAYLOAD_PUBLIC_SERVER_URL`

---

### `hobbyrider-payload` (PayloadCMS Project)

**Needs PayloadCMS-specific variables:**

#### Required:
- ✅ `DATABASE_URL` - **Same database as main app** (they share the database)
- ✅ `PAYLOAD_SECRET` - **Required for PayloadCMS** (generate with `openssl rand -base64 32`)
- ✅ `PAYLOAD_PUBLIC_SERVER_URL` - Set to `https://payload.hobbyrider.io`

#### Optional (but recommended):
- `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` - If you want error tracking for PayloadCMS too

**Do NOT add:**
- ❌ `NEXTAUTH_SECRET` - PayloadCMS has its own auth system
- ❌ `NEXTAUTH_URL` - Not needed for PayloadCMS

---

## Summary Table

| Variable | hobbyrider (Main) | hobbyrider-payload (PayloadCMS) |
|----------|-------------------|----------------------------------|
| `DATABASE_URL` | ✅ Yes | ✅ Yes (same database) |
| `PAYLOAD_SECRET` | ❌ No | ✅ **Required** |
| `PAYLOAD_PUBLIC_SERVER_URL` | ❌ No | ✅ **Required** (`https://payload.hobbyrider.io`) |
| `NEXTAUTH_SECRET` | ✅ Yes | ❌ No |
| `NEXTAUTH_URL` | ✅ Yes | ❌ No |
| `SENTRY_DSN` | ✅ Optional | ✅ Optional |

---

## Quick Setup for `hobbyrider-payload`

1. Go to Vercel Dashboard → `hobbyrider-payload` project
2. Settings → Environment Variables
3. Add these three variables:

```bash
# Required - Same as main app
DATABASE_URL=your_postgresql_connection_string

# Required - Generate new one for PayloadCMS
PAYLOAD_SECRET=<generate with: openssl rand -base64 32>

# Required - Your PayloadCMS subdomain
PAYLOAD_PUBLIC_SERVER_URL=https://payload.hobbyrider.io
```

4. **Important**: Make sure to set them for **Production** environment (or all environments)
5. Click "Save"
6. Redeploy the project

---

## Generate PAYLOAD_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as the value for `PAYLOAD_SECRET` in Vercel.

---

## Why They Share DATABASE_URL?

Both projects can use the same database because:
- PayloadCMS creates its own tables (prefixed, won't conflict)
- Your main app uses Prisma with its own tables
- They're completely separate applications, just sharing infrastructure

This is a common pattern and works perfectly fine.

---

## After Adding Variables

1. **Redeploy** the `hobbyrider-payload` project
2. Visit `https://payload.hobbyrider.io/admin`
3. Create your first admin user
4. Start creating blog posts!
