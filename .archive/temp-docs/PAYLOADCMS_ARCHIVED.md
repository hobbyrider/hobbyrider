# PayloadCMS Archived

PayloadCMS has been archived to prevent interference with the main hobbyrider product.

**Location:** `.archive/payloadcms/payload-cms-20260120/`

**Status:** Archived - not actively used

## What Was Done

✅ **Archived PayloadCMS:**
- Moved `payload-cms/` directory to `.archive/payloadcms/payload-cms-20260120/`
- All code, configuration, and documentation preserved

✅ **Cleaned Up Main Project:**
- Removed PayloadCMS webpack exclusions from `next.config.ts`
- Removed payload subdomain handling from `middleware.ts`
- Updated `tsconfig.json` to exclude `.archive` directory
- Moved PayloadCMS docs to archive

✅ **Preserved Everything:**
- Complete PayloadCMS project setup
- All configuration files
- Documentation and troubleshooting guides
- Scripts and migration attempts

## Vercel Cleanup Steps

Since PayloadCMS is archived, clean up the Vercel `hobbyrider-payload` project:

### Recommended: Delete the Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find **`hobbyrider-payload`** project
3. Go to **Settings** → **General**
4. Scroll to **Danger Zone**
5. Click **Delete Project**
6. Confirm deletion

**Why delete?**
- Prevents accidental deployments
- Cleaner dashboard
- All code is preserved in git archive
- Can recreate later if needed

### Alternative: Archive/Pause

If you prefer to keep it:
1. Rename project to `hobbyrider-payload-archived`
2. Remove domain `payload.hobbyrider.io` from project
3. Disable automatic deployments in Git settings

## If You Want to Restore Later

1. Check PayloadCMS GitHub for fixes to migration/table creation issues
2. Move `.archive/payloadcms/payload-cms-20260120/` back to `payload-cms/` in root
3. Restore configuration changes from git history
4. Create new Vercel project with Root Directory: `payload-cms`
5. Reconfigure domain and environment variables

See `.archive/payloadcms/README.md` for more details.
