# CSS Not Loading on Custom Domain

## Issue

The website renders completely unstyled (no CSS) on `hobbyrider.io` while working correctly on `hobbyrider.vercel.app`.

**Symptoms:**
- Page appears as plain HTML (white background, black text)
- No Tailwind CSS styles applied
- No layout, colors, or design elements
- Elements stacked vertically without proper spacing
- Input elements appear as raw HTML form controls

## Root Cause

This is typically caused by:
1. **Domain pointing to wrong deployment** - Custom domain not updated to latest build
2. **CDN/Cache issues** - Old cached version without CSS
3. **Build differences** - Different builds between domains
4. **Vercel domain configuration** - Custom domain not properly synced

## Solutions

### 1. Verify Domain Configuration in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Verify `hobbyrider.io` is properly configured
3. Check that it points to the **same deployment** as `hobbyrider.vercel.app`
4. Ensure DNS records are correct

### 2. Clear Browser Cache

**For the user experiencing the issue:**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache completely
- Try incognito/private mode
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

### 3. Redeploy to Production

Force a fresh deployment to ensure both domains are in sync:

```bash
# Trigger a new deployment
git commit --allow-empty -m "Force redeploy for domain sync"
git push origin main
```

Or redeploy via Vercel Dashboard:
- Go to Deployments
- Click "..." on latest deployment
- Select "Redeploy"

### 4. Verify Environment Variables

Ensure `NEXTAUTH_URL` is set correctly in Vercel:

**For hobbyrider.io:**
```
NEXTAUTH_URL=https://hobbyrider.io
```

**Check in Vercel:**
- Settings → Environment Variables
- Verify `NEXTAUTH_URL` matches your custom domain
- Ensure it's set for **Production** environment

### 5. Check Build Output

Verify the build includes CSS files:

```bash
npm run build
ls -la .next/static/css/
```

CSS files should be generated in `.next/static/css/`.

### 6. Domain DNS Check

Verify DNS is pointing correctly:

```bash
# Check DNS records
nslookup hobbyrider.io
dig hobbyrider.io

# Should point to Vercel's IPs
```

### 7. Check Vercel Domain Status

In Vercel Dashboard:
- Settings → Domains
- Check status of `hobbyrider.io`
- Should show "Valid Configuration"
- If showing errors, follow Vercel's domain setup guide

## Prevention

### Ensure Consistent Deployments

1. **Always deploy to production** - Both domains should use the same deployment
2. **Set NEXTAUTH_URL correctly** - Match your custom domain
3. **Monitor deployments** - Check both domains after each deployment

### Best Practices

1. **Test both domains** after deployment
2. **Use Vercel's domain verification** - Ensure domain is properly configured
3. **Keep DNS records updated** - Follow Vercel's domain setup guide
4. **Monitor build outputs** - Verify CSS files are generated

## Quick Fix Checklist

- [ ] Verify `hobbyrider.io` domain in Vercel Dashboard
- [ ] Check `NEXTAUTH_URL` environment variable matches domain
- [ ] Clear browser cache and hard refresh
- [ ] Redeploy to production
- [ ] Verify DNS records point to Vercel
- [ ] Check both domains render correctly after fix

## Related Documentation

- **Deployment**: See `docs/setup/DEPLOYMENT.md`
- **Environment Variables**: See `docs/setup/DEPLOYMENT.md#environment-variables`
- **Vercel Domain Setup**: [Vercel Domain Documentation](https://vercel.com/docs/concepts/projects/domains)

---

**Note**: If the issue persists after trying these solutions, check Vercel's deployment logs and domain configuration status in the dashboard.
