# PayloadCMS Archive

This directory contains the archived PayloadCMS setup from the hobbyrider project.

## Contents

- `payload-cms-YYYYMMDD/` - Complete PayloadCMS project (archived on date)
- `ARCHIVE_NOTE.md` - Details about why it was archived
- `VERCEL_CLEANUP.md` - Instructions for cleaning up Vercel project
- `PAYLOAD_ENV_VARIABLES.md` - Environment variables documentation
- `PAYLOAD_SUBDOMAIN_SETUP.md` - Subdomain setup documentation

## Why It Was Archived

PayloadCMS 3.0 has critical issues that prevented successful deployment:
1. Migration system doesn't create migration files (TypeScript module resolution issues)
2. `push: true` mode fails on completely empty databases (Drizzle introspection bug)
3. Cannot create database tables in production environment

## If You Want to Restore Later

1. Check PayloadCMS GitHub for fixes to migration/table creation issues
2. Move `payload-cms-YYYYMMDD/` back to `payload-cms/` in project root
3. Restore configuration changes (see commit history)
4. Create new Vercel project with Root Directory set to `payload-cms`
5. Reconfigure domain and environment variables

## Alternative CMS Options

If PayloadCMS issues aren't resolved, consider:
- **Directus** - Self-hosted, uses existing PostgreSQL, easy setup
- **Sanity** - Cloud-hosted, excellent Next.js integration
- **Strapi** - Self-hosted, similar to PayloadCMS but more mature
- **Custom Prisma Admin** - Build your own using existing Prisma setup

See the main project's documentation or consult AI assistant for recommendations.
