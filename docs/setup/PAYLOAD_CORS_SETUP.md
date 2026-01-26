# Payload CMS CORS Configuration

To allow `hobbyrider.io` to fetch blog posts from `payload.hobbyrider.io`, you need to configure CORS in your Payload CMS instance.

## Steps to Configure CORS

1. **Navigate to your Payload repository** (the `payload-website-starter` project)

2. **Open the Payload config file** (usually `src/payload.config.ts` or `payload.config.ts`)

3. **Add CORS configuration** to allow requests from `hobbyrider.io`:

```typescript
import { buildConfig } from 'payload/config'

export default buildConfig({
  // ... your existing config
  cors: [
    'https://hobbyrider.io',
    'https://www.hobbyrider.io',
    'http://localhost:3000', // For local development
    'http://localhost:3001', // Alternative local port
  ],
  // ... rest of your config
})
```

4. **Redeploy your Payload instance** to Vercel

5. **Verify CORS is working** by checking the response headers:
   ```bash
   curl -I "https://payload.hobbyrider.io/api/posts?limit=1"
   ```
   
   You should see `Access-Control-Allow-Origin` header in the response.

## Alternative: Server-Side API Route

If CORS configuration doesn't work or you prefer a different approach, you can create a Next.js API route that proxies requests to Payload. This would be in `app/api/payload/posts/route.ts` and would make server-to-server requests (which don't have CORS restrictions).

## Testing the Connection

After configuring CORS, test the connection:

1. Visit `http://localhost:3000/blog` locally
2. Check the browser console for any CORS errors
3. Check the server logs for fetch errors

If you still see errors, check:
- The Payload collection name (might be `posts` or `blog-posts`)
- The API endpoint format
- Network/firewall issues
