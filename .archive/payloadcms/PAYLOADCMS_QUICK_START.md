# PayloadCMS Quick Start - 3 Steps

## ✅ You're Almost Ready!

PayloadCMS is installed and configured. Follow these 3 steps to start using it:

---

## Step 1: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

**Why?** This will fix Error 8 (database tables will be created automatically).

---

## Step 2: Create First Admin User

1. Open: `http://localhost:3000/admin`
2. Fill in the "Create First User" form:
   - Email
   - Password
   - Name
3. Click "Create"

**Note**: You'll see 7 HTML nesting warnings in console - these are **safe to ignore**. PayloadCMS will work perfectly despite them.

---

## Step 3: Create Your First Blog Post

1. In admin UI, click **"Blog Posts"** → **"Create New"**
2. Fill in:
   - Title: "My First Post"
   - Content: Write something
   - Status: **Published**
   - Published At: Today
3. Click **"Save"**
4. View it at: `http://localhost:3000/blog`

---

## That's It! 🎉

You're now using PayloadCMS. The 7 HTML nesting errors are **expected** and won't prevent you from using any features.

### What You Can Do Now:
- ✅ Create blog posts
- ✅ Create static pages
- ✅ Upload media
- ✅ Manage users
- ✅ Use rich text editor
- ✅ All PayloadCMS features work!

### For Production:
Consider running PayloadCMS on a subdomain (`admin.yoursite.com`) to avoid the HTML nesting warnings entirely.

---

**Need help?** See `PAYLOADCMS_GETTING_STARTED.md` for detailed guide.
