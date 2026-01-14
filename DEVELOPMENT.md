# Development Guide

## Prisma Setup & Sync

### Automatic Prisma Client Generation

The project is configured to automatically regenerate the Prisma client:

- **On `npm install`**: Runs `prisma generate` via `postinstall` script
- **On `npm run dev`**: Runs `prisma generate` before starting dev server
- **On `npm run build`**: Runs `prisma generate` and `prisma db push` before building

### Manual Commands

If you need to manually sync Prisma:

```bash
# Generate Prisma client (after schema changes)
npm run db:generate

# Push schema changes to database
npm run db:push

# Do both (recommended after schema changes)
npm run db:sync

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Common Issues & Solutions

#### Issue: "Unknown field X for model Y"
**Solution**: Run `npm run db:sync` to regenerate client and sync database

#### Issue: "Table does not exist in database"
**Solution**: Run `npm run db:push` to create missing tables

#### Issue: Prisma client out of sync
**Solution**: 
1. Stop dev server
2. Run `npm run db:sync`
3. Clear `.next` folder: `rm -rf .next`
4. Restart dev server: `npm run dev`

### Workflow After Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npm run db:sync` (or `npm run dev` which does this automatically)
3. If needed, clear Next.js cache: `rm -rf .next`
4. Restart dev server if running

### CI/CD Integration

For production deployments, ensure:
- `postinstall` script runs (automatically runs `prisma generate`)
- Database migrations are handled (Vercel runs `prisma db push` automatically)

## File Structure

```
prisma/
  schema.prisma       # Database schema definition
  migrations/         # Migration files (if using migrations)

app/
  actions/           # Server actions
  api/               # API routes
  components/        # React components
```

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string

Optional:
- `ADMIN_PASSWORD` - Password for admin delete functionality

## Development Tips

1. **Always run `db:sync` after schema changes** - This ensures both client and database are updated
2. **Use Prisma Studio** - Run `npm run db:studio` to visually inspect your database
3. **Check for errors early** - If you see Prisma errors, sync immediately
4. **Clear Next.js cache** - If Prisma client seems stale, clear `.next` folder
