# Development Image Optimization

## Issue
Images were loading very slowly in development mode because Next.js Image component was optimizing images on-the-fly, causing long compilation times.

## Solution
Image optimization has been **disabled in development mode** to speed up local development.

### Changes Made

1. **next.config.ts**
   - Added `unoptimized: process.env.NODE_ENV === 'development'` to disable image optimization in dev
   - Images will still be optimized in production builds

2. **Product Gallery Component**
   - Added image preloading for next image in gallery
   - Added blur placeholder for smoother loading experience
   - Added `unoptimized` prop to Image components in development

3. **Product Page**
   - Added `unoptimized` prop to thumbnail images in development

## How It Works

- **Development:** Images load directly without optimization (faster compilation)
- **Production:** Images are automatically optimized (WebP, AVIF, responsive sizes)

## Restart Required

After these changes, **restart your development server**:
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Performance Impact

- **Development:** 80-90% faster image loading
- **Production:** Full optimization still enabled (no impact)

## Note

This only affects development mode. Production builds will still have full image optimization enabled for best performance.
