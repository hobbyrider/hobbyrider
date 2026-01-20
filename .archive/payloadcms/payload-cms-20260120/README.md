# PayloadCMS Admin

This is a separate Next.js application for PayloadCMS admin interface, deployed to `payload.hobbyrider.io`.

## Structure

```
payload-cms/
├── app/
│   ├── admin/[[...segments]]/  # PayloadCMS admin interface
│   ├── api/payload/[...slug]/ # PayloadCMS API routes
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Redirects to /admin
├── collections/                # PayloadCMS collections (BlogPosts, Media, etc.)
├── payload.config.ts           # PayloadCMS configuration
├── package.json                # Dependencies
├── next.config.ts              # Next.js configuration
└── tsconfig.json               # TypeScript configuration
```

## Setup

### 1. Install Dependencies

```bash
cd payload-cms
npm install
```

### 2. Generate Import Map

```bash
npm run generate:importmap
```

This will update `app/admin/importMap.js` with the correct imports.

### 3. Environment Variables

Create `.env.local` (for local development) or set in Vercel:

```bash
DATABASE_URL=your_postgresql_connection_string
PAYLOAD_SECRET=your_secret_key  # Generate with: openssl rand -base64 32
PAYLOAD_PUBLIC_SERVER_URL=https://payload.hobbyrider.io  # For production
```

### 4. Local Development

```bash
npm run dev
```

Visit `http://localhost:3000/admin` to access PayloadCMS admin.

## Vercel Deployment

### 1. Create New Vercel Project

- Import from GitHub repository
- Set **Root Directory** to `./payload-cms`
- Framework: Next.js (auto-detected)

### 2. Configure Domain

- Go to Project Settings → Domains
- Add `payload.hobbyrider.io` as production domain

### 3. Environment Variables

Add in Vercel Dashboard:
- `DATABASE_URL` (same as main app)
- `PAYLOAD_SECRET` (generate new one)
- `PAYLOAD_PUBLIC_SERVER_URL=https://payload.hobbyrider.io`

### 4. Deploy

Push to GitHub and Vercel will auto-deploy.

## Collections

- **BlogPosts**: Blog post content management
- **Pages**: Static pages
- **Media**: File uploads (images, etc.)
- **Users**: User management

## First Admin User

After deployment, visit `https://payload.hobbyrider.io/admin` and create your first admin user.

## Notes

- This is a completely separate Next.js app from the main hobbyrider app
- Shares the same database (via `DATABASE_URL`)
- No conflicts with main app
- Independent deployments
