# PostHog Analytics Setup

PostHog has been integrated into Hobbyrider for product analytics, user behavior tracking, and insights.

## Overview

PostHog provides:
- **Product Analytics**: Track user actions, pageviews, and custom events
- **Session Replay**: Visual debugging with user session recordings (optional)
- **Feature Flags**: A/B testing and feature rollouts (can be added later)
- **User Identification**: Track users across sessions
- **Funnels & Insights**: Analyze user journeys and conversion rates

## Setup Instructions

### 1. Create a PostHog Account

1. Go to [posthog.com](https://posthog.com) and sign up (free tier available)
2. Create a new project
3. Copy your **Project API Key** from Project Settings

### 2. Configure Environment Variables

Add the following environment variables to your `.env.local` (development) and Vercel (production):

```bash
# PostHog API Key (required)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_api_key_here

# PostHog Host (optional - defaults to US cloud)
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
# For EU cloud, use: https://eu.i.posthog.com

# Disable session recording (optional - set to "true" to disable)
NEXT_PUBLIC_POSTHOG_DISABLE_SESSION_RECORDING=false
```

### 3. Vercel Configuration

Add these environment variables in Vercel Dashboard:
- **Settings** → **Environment Variables**
- Add all variables from step 2

## Features Implemented

### Automatic Tracking

- **Pageviews**: Automatically tracked on route changes
- **Page Leaves**: Tracked when users leave pages

### Custom Event Tracking

The following events are automatically tracked:

1. **Product Views** (`product_viewed`)
   - Triggered when users view product pages
   - Properties: `product_id`, `product_name`

2. **Product Upvotes** (`product_upvoted`)
   - Triggered when users upvote products
   - Properties: `product_id`, `product_name`

3. **Product Submissions** (`product_submitted`)
   - Triggered when users submit new products
   - Properties: `product_id`, `product_name`

4. **Comment Creation** (`comment_created`)
   - Triggered when users create comments
   - Properties: `product_id`, `comment_id`

5. **Search Queries** (`search_performed`)
   - Triggered when users search for products
   - Properties: `query`, `results_count`

6. **Category Views** (`category_viewed`)
   - Triggered when users view category pages
   - Properties: `category_slug`, `category_name`

### User Identification

Users are automatically identified when they log in. To manually identify users:

```typescript
import { identifyUser } from "@/lib/posthog"

// After login
identifyUser(userId, {
  email: user.email,
  username: user.username,
  name: user.name,
})
```

## Usage in Code

### Track Custom Events

```typescript
import { trackEvent } from "@/lib/posthog"

// Track any custom event
trackEvent("button_clicked", {
  button_name: "submit",
  page: "homepage",
})
```

### Track Product Views

```typescript
import { trackProductView } from "@/lib/posthog"

trackProductView(productId, productName)
```

### Track User Actions

```typescript
import { trackProductUpvote, trackSearch, trackCommentCreated } from "@/lib/posthog"

// Track upvote
trackProductUpvote(productId, productName)

// Track search
trackSearch(query, resultsCount)

// Track comment
trackCommentCreated(productId, commentId)
```

### Set User Properties

```typescript
import { setUserProperties } from "@/lib/posthog"

setUserProperties({
  plan: "premium",
  signup_date: "2024-01-01",
})
```

### Reset User (on logout)

```typescript
import { resetUser } from "@/lib/posthog"

// On logout
resetUser()
```

## Configuration Files

- **`app/components/posthog-provider.tsx`**: PostHog initialization and pageview tracking
- **`lib/posthog.ts`**: Utility functions for tracking events
- **`app/layout.tsx`**: PostHog provider wrapper

## Privacy & Compliance

- **Do Not Track (DNT)**: PostHog respects DNT headers (`respect_dnt: true`)
- **GDPR Compliant**: PostHog is GDPR compliant and can be self-hosted
- **Data Retention**: Configure retention policies in PostHog dashboard
- **IP Anonymization**: Can be enabled in PostHog settings

## Session Replay

Session replay is available but disabled by default in development. To enable:

1. Set `NEXT_PUBLIC_POSTHOG_DISABLE_SESSION_RECORDING=false` (or remove the env var)
2. Configure recording settings in PostHog dashboard
3. Note: Session replay uses additional quota

## Cost Considerations

### Free Tier Limits

PostHog offers generous free tiers:
- **1 million events/month** (Product Analytics)
- **5,000 recordings/month** (Session Replay)
- **1 million requests/month** (Feature Flags)

### Pricing

- **Product Analytics**: $0.00005/event after free tier
- **Session Replay**: $0.005/recording after free tier
- **Feature Flags**: $0.0001/request after free tier

Most small to medium apps stay within the free tier.

## Testing

### Local Testing

1. Set up your PostHog API key in `.env.local`
2. Start your dev server: `npm run dev`
3. Navigate through the app and perform actions
4. Check your PostHog dashboard for events (may take a few seconds)

### Verify Events

1. Go to your PostHog dashboard
2. Navigate to **Activity** or **Events**
3. You should see:
   - Pageview events
   - Custom events (upvotes, comments, searches, etc.)

## Troubleshooting

### Events Not Appearing

1. Check environment variables are set correctly
2. Verify API key is correct
3. Check browser console for PostHog errors
4. Verify PostHog is loaded: `posthog.__loaded` in browser console

### Development Mode

PostHog is active in development by default. To disable:

```typescript
// In posthog-provider.tsx, uncomment:
if (process.env.NODE_ENV === "development") {
  posthog.opt_out_capturing()
}
```

### Build Errors

If you see PostHog-related build errors:
1. Ensure `posthog-js` is installed: `npm install posthog-js`
2. Check `posthog-provider.tsx` is a client component (`"use client"`)
3. Verify environment variables are prefixed with `NEXT_PUBLIC_`

## Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog Next.js Guide](https://posthog.com/docs/integrate/nextjs)
- [PostHog Dashboard](https://app.posthog.com)
- [PostHog Pricing](https://posthog.com/pricing)

---

**Status**: ✅ PostHog is integrated and ready for production use.

**Next Steps**:
1. Create PostHog account and get API key
2. Add environment variables
3. Deploy and monitor events in PostHog dashboard
