# Content Moderation Guide

## Quick Start: Make Yourself an Admin

You have **3 options** to set admin status:

### Option 1: Using Prisma Studio (Easiest - Visual Interface)

1. **Open Prisma Studio:**
   ```bash
   npx prisma studio
   ```

2. **Navigate to User model** (click on "User" in the left sidebar)

3. **Find your user** (search by email or username)

4. **Click on your user** to edit

5. **Check the `isAdmin` checkbox** (set to `true`)

6. **Click "Save 1 change"**

Done! You're now an admin.

---

### Option 2: Using a SQL Query (Quick)

If you know your email address, you can run:

```bash
# Connect to your database and run:
# UPDATE "User" SET "isAdmin" = true WHERE email = 'your-email@example.com';
```

Or use Prisma's built-in query:

```bash
npx prisma db execute --stdin
```

Then paste:
```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'your-email@example.com';
```

---

### Option 3: Using Node.js Script

1. **Install tsx** (one-time):
   ```bash
   npm install -D tsx
   ```

2. **Run the script:**
   ```bash
   npx tsx scripts/set-admin.ts your-email@example.com
   ```

---

## Accessing the Moderation Dashboard

Once you're an admin:

1. **Log in** to your account (if not already logged in)

2. **Navigate to:** `http://localhost:3000/admin/moderation`

   Or visit any product page and you'll see the moderation interface.

3. **You'll see:**
   - Pending reports count
   - Total reports count
   - List of all pending reports
   - Reviewed reports (history)

---

## How to Moderate Content

### Step 1: View Reports

When you visit `/admin/moderation`, you'll see all pending reports with:
- **Report reason** (spam, inappropriate, etc.)
- **Reporter information** (who reported it)
- **Content details** (product name, comment text, etc.)
- **Links** to view the actual content

### Step 2: Take Action

For each report, you have **3 options**:

1. **Dismiss** (Gray button)
   - Marks the report as "dismissed"
   - No action taken on content
   - Use when report is false/not valid

2. **Hide Content** (Yellow button)
   - Sets `isHidden: true` on the content
   - Content is removed from public feeds
   - Can be unhidden later if needed
   - Use for questionable content that needs review

3. **Remove Content** (Red button)
   - Permanently removes/hides the content
   - Replaces content with "[Removed]" text
   - Use for clearly inappropriate content

### Step 3: Review History

All reviewed reports are shown below pending reports, so you can:
- See what actions were taken
- Review past moderation decisions
- Track moderation activity

---

## How Users Report Content

### Reporting Products

1. Visit any product page
2. Click the **"Report"** button (next to "Visit Website")
3. Select a reason from the dropdown:
   - Spam
   - Inappropriate content
   - Misleading information
   - Copyright violation
   - Harassment
   - Other (with optional details)
4. Click **"Submit"**

### Reporting Comments

1. Visit any product page with comments
2. Find the comment you want to report
3. Click the **"Report"** button (on the right side of the comment)
4. Select a reason and submit

---

## Features

✅ **Duplicate Prevention** - Users can only report the same content once  
✅ **Auto-filtering** - Hidden content automatically excluded from feeds  
✅ **Admin-only Access** - Only admins can view/moderation dashboard  
✅ **Content Links** - Easy navigation to reported content  
✅ **Status Tracking** - All reports have status (pending, dismissed, resolved)  
✅ **Review History** - See all past moderation actions  

---

## Troubleshooting

### "You must be an admin" error

- Make sure you've set `isAdmin: true` for your user
- Log out and log back in to refresh your session
- Check that you're logged in with the correct account

### Can't see reports

- Make sure there are actual reports submitted
- Check that reports have `status: "pending"`
- Verify you're accessing `/admin/moderation` (not just `/admin`)

### Reports not showing content

- Check that the product/comment still exists
- Verify database connection is working
- Check browser console for errors

---

## Quick Commands Reference

```bash
# Open Prisma Studio (visual database editor)
npx prisma studio

# Set admin via SQL (replace with your email)
npx prisma db execute --stdin
# Then paste: UPDATE "User" SET "isAdmin" = true WHERE email = 'your@email.com';

# View all users
npx prisma studio
# Navigate to User model

# Check if user is admin
npx prisma studio
# Navigate to User model, find your user, check isAdmin field
```

---

**Need help?** Check the moderation actions in `/app/actions/moderation.ts` or the admin UI in `/app/admin/moderation/`
