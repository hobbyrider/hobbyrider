# PostHog Developer Guide

## Overview

PostHog is integrated into Hobbyrider for **product analytics, session replay, and user behavior tracking**. This guide ensures all new features properly integrate with PostHog.

**Key Principle**: Every user-facing action should be tracked in PostHog (analytics), while errors go to Sentry.

---

## Quick Checklist for New Features

When adding a new feature, ensure you:

- [ ] Track key user actions with PostHog events
- [ ] Use standardized event names (see below)
- [ ] Include relevant properties (product_id, user_id, etc.)
- [ ] Test that events appear in PostHog dashboard
- [ ] Verify session replay captures the feature
- [ ] Update this guide if adding new event types

---

## Architecture

### PostHog Initialization

PostHog is initialized in `app/components/posthog-provider.tsx` and wrapped around the entire app in `app/layout.tsx`. This means:

✅ **PostHog is available globally** - No need to initialize it in new components  
✅ **Session replay is enabled** - Automatically captures all user interactions  
✅ **Pageviews are automatic** - Tracked on route changes  

### Key Files

- **`app/components/posthog-provider.tsx`**: PostHog initialization and pageview tracking
- **`lib/posthog.ts`**: Utility functions for tracking events
- **`app/layout.tsx`**: PostHog provider wrapper (ensures global availability)
- **`app/components/auth-provider.tsx`**: User identification on login/logout

---

## Standardized Event Names

Use these event names for consistency and funnel analysis:

### Core Product Events

| Event Name | When to Use | Properties |
|------------|-------------|------------|
| `submit_product` | User submits a new product | `product_id`, `product_name` |
| `upvote_product` | User upvotes a product | `product_id`, `product_name` |
| `product_viewed` | User views a product page | `product_id`, `product_name` |
| `comment_created` | User creates a comment | `product_id`, `comment_id` |

### Authentication Events

| Event Name | When to Use | Properties |
|------------|-------------|------------|
| `signup_success` | User successfully signs up | `method` (credentials/oauth), `username` |
| `login_success` | User successfully logs in | `method` (credentials/oauth) |

### Navigation Events

| Event Name | When to Use | Properties |
|------------|-------------|------------|
| `search_performed` | User performs a search | `query`, `results_count` |
| `category_viewed` | User views a category page | `category_slug`, `category_name` |
| `search_modal_opened` | User opens search modal | (none) |
| `search_result_clicked` | User clicks a search result | `product_id`, `product_name`, `search_query` |

### Other Events

| Event Name | When to Use | Properties |
|------------|-------------|------------|
| `ownership_claimed` | User claims product ownership | `product_id`, `product_name` |
| `content_reported` | User reports content | `content_type`, `content_id`, `reason` |
| `user_followed` | User follows another user | `followed_user_id` |
| `user_unfollowed` | User unfollows another user | `followed_user_id` |
| `product_url_copied` | User copies product URL | `product_id`, `product_name` |

---

## How to Track Events in New Features

### 1. Import PostHog Functions

```typescript
import { trackEvent, trackProductView, trackProductUpvote } from "@/lib/posthog"
```

### 2. Track User Actions

**For existing event types**, use the helper functions:

```typescript
// Product upvote
import { trackProductUpvote } from "@/lib/posthog"

trackProductUpvote(productId, productName)
```

**For new event types**, use `trackEvent` with standardized names:

```typescript
import { trackEvent } from "@/lib/posthog"

// Track a new feature action
trackEvent("feature_action_completed", {
  feature_id: featureId,
  feature_name: featureName,
  user_id: userId,
})
```

### 3. Track in Client Components

PostHog only works in client components (browser context):

```typescript
"use client"

import { trackEvent } from "@/lib/posthog"

export function MyNewFeature() {
  const handleAction = () => {
    // Your feature logic here
    
    // Track the action
    trackEvent("my_feature_action", {
      action_type: "click",
      feature_id: "123",
    })
  }

  return <button onClick={handleAction}>Click me</button>
}
```

### 4. Track in Server Actions

For server-side tracking, use the server-side PostHog client:

```typescript
"use server"

import { getPostHogClient } from "@/lib/posthog-server"

export async function myServerAction() {
  const posthog = getPostHogClient()
  
  if (posthog) {
    posthog.capture({
      distinctId: userId || "anonymous",
      event: "server_action_completed",
      properties: {
        action_type: "data_export",
        user_id: userId,
      },
    })
  }
}
```

---

## Session Replay

### How It Works

Session replay is **automatically enabled** and captures:
- ✅ All user interactions (clicks, scrolls, form inputs)
- ✅ Page navigation
- ✅ Console logs
- ✅ Network requests
- ✅ JavaScript errors

### Configuration

Session replay is controlled by environment variable:

```bash
# Enable session replay (default)
NEXT_PUBLIC_POSTHOG_DISABLE_SESSION_RECORDING=false

# Disable session replay
NEXT_PUBLIC_POSTHOG_DISABLE_SESSION_RECORDING=true
```

### Privacy Settings

PostHog automatically:
- Masks sensitive inputs (passwords, credit cards)
- Respects Do Not Track (DNT) headers
- Allows IP anonymization (configure in PostHog dashboard)

### Testing Session Replay

1. Perform actions in your app
2. Go to PostHog dashboard → **Session Replay**
3. Find your session and watch the replay
4. Verify all interactions are captured

---

## User Identification

### Automatic Identification

Users are automatically identified when they log in via `app/components/auth-provider.tsx`.

### Manual Identification

If you need to identify users manually:

```typescript
import { identifyUser } from "@/lib/posthog"

// After login/signup
identifyUser(userId, {
  email: user.email,
  username: user.username,
  name: user.name,
})
```

### Reset on Logout

User identification is automatically reset on logout. If needed manually:

```typescript
import { resetUser } from "@/lib/posthog"

// On logout
resetUser()
```

---

## Best Practices

### 1. Event Naming

✅ **DO**: Use snake_case, descriptive names
```typescript
trackEvent("product_favorited", { product_id: "123" })
```

❌ **DON'T**: Use camelCase or vague names
```typescript
trackEvent("productFavorited", { product_id: "123" }) // ❌
trackEvent("click", { product_id: "123" }) // ❌ Too vague
```

### 2. Properties

✅ **DO**: Include relevant context
```typescript
trackEvent("submit_product", {
  product_id: productId,
  product_name: productName,
  category: categoryName,
  has_description: !!description,
})
```

❌ **DON'T**: Include sensitive data
```typescript
trackEvent("login", {
  password: password, // ❌ Never track passwords
  credit_card: cardNumber, // ❌ Never track PII
})
```

### 3. Event Timing

✅ **DO**: Track after successful actions
```typescript
try {
  await submitProduct(data)
  trackEvent("submit_product", { product_id: productId }) // ✅ After success
} catch (error) {
  // Don't track on error
}
```

❌ **DON'T**: Track before actions complete
```typescript
trackEvent("submit_product", { product_id: productId }) // ❌ Too early
await submitProduct(data) // Might fail
```

### 4. Avoid Over-Tracking

✅ **DO**: Track meaningful user actions
- Button clicks that trigger important actions
- Form submissions
- Navigation to key pages
- Feature usage

❌ **DON'T**: Track every interaction
- Mouse movements
- Scroll events (unless specifically needed)
- Hover states
- Render events

---

## Testing PostHog Integration

### Local Testing

1. **Set up environment variables** in `.env.local`:
   ```bash
   NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Perform actions** in your app

4. **Check PostHog dashboard**:
   - Go to https://app.posthog.com
   - Navigate to **Activity** or **Events**
   - Verify events appear (may take a few seconds)

### Production Testing

1. **Verify environment variables** are set in Vercel
2. **Deploy to production**
3. **Perform test actions**
4. **Check PostHog dashboard** for events

### Debugging

**Check if PostHog is loaded**:
```javascript
// In browser console
posthog.__loaded // Should be true
```

**Manually capture an event**:
```javascript
// In browser console
posthog.capture("test_event", { test: true })
```

**Check PostHog configuration**:
```javascript
// In browser console
posthog.config
```

---

## Common Patterns

### Pattern 1: Track Button Clicks

```typescript
"use client"

import { trackEvent } from "@/lib/posthog"

export function MyButton() {
  const handleClick = () => {
    // Your logic
    doSomething()
    
    // Track the action
    trackEvent("button_clicked", {
      button_name: "submit",
      page: "homepage",
    })
  }

  return <button onClick={handleClick}>Submit</button>
}
```

### Pattern 2: Track Form Submissions

```typescript
"use client"

import { trackEvent } from "@/lib/posthog"

export function MyForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await submitForm(data)
      
      // Track successful submission
      trackEvent("form_submitted", {
        form_type: "contact",
        has_attachment: !!attachment,
      })
    } catch (error) {
      // Don't track on error
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### Pattern 3: Track Page Views (Custom Pages)

For custom pages that need specific tracking:

```typescript
"use client"

import { useEffect } from "react"
import { trackEvent } from "@/lib/posthog"

export function CustomPage() {
  useEffect(() => {
    // Track custom page view
    trackEvent("custom_page_viewed", {
      page_type: "dashboard",
      user_role: userRole,
    })
  }, [])

  return <div>...</div>
}
```

### Pattern 4: Track Feature Usage

```typescript
"use client"

import { trackEvent } from "@/lib/posthog"

export function FeatureToggle() {
  const [enabled, setEnabled] = useState(false)

  const handleToggle = () => {
    setEnabled(!enabled)
    
    // Track feature usage
    trackEvent("feature_toggled", {
      feature_name: "dark_mode",
      enabled: !enabled,
    })
  }

  return <button onClick={handleToggle}>Toggle</button>
}
```

---

## Troubleshooting

### Events Not Appearing

1. **Check environment variables**:
   ```bash
   echo $NEXT_PUBLIC_POSTHOG_KEY
   ```

2. **Verify PostHog is loaded**:
   ```javascript
   // Browser console
   posthog.__loaded
   ```

3. **Check browser console** for errors

4. **Verify API key** is correct in PostHog dashboard

### Session Replay Not Working

1. **Check environment variable**:
   ```bash
   NEXT_PUBLIC_POSTHOG_DISABLE_SESSION_RECORDING=false
   ```

2. **Verify in PostHog dashboard** → Settings → Session Replay

3. **Check quota** - Free tier has 5,000 recordings/month

### Build Errors

If you see PostHog-related build errors:

1. **Ensure `posthog-js` is installed**:
   ```bash
   npm install posthog-js
   ```

2. **Check component is client component**:
   ```typescript
   "use client" // Must be at top of file
   ```

3. **Verify imports**:
   ```typescript
   import { trackEvent } from "@/lib/posthog" // ✅
   import posthog from "posthog-js" // ❌ Don't import directly
   ```

---

## Adding New Event Types

When adding a new event type:

1. **Choose a standardized name** (snake_case, descriptive)
2. **Document it** in this guide (add to "Standardized Event Names" table)
3. **Create a helper function** in `lib/posthog.ts` if it's commonly used:
   ```typescript
   export function trackFeatureAction(featureId: string, action: string) {
     trackEvent("feature_action", {
       feature_id: featureId,
       action: action,
     })
   }
   ```
4. **Update this guide** with the new event

---

## Integration Checklist for New Features

When adding a new feature, use this checklist:

- [ ] **PostHog tracking added** for key user actions
- [ ] **Event names standardized** (snake_case, descriptive)
- [ ] **Properties included** (relevant context, no PII)
- [ ] **Tested locally** - events appear in PostHog dashboard
- [ ] **Session replay verified** - interactions are captured
- [ ] **Documentation updated** - new events added to this guide
- [ ] **Production tested** - events work in production

---

## Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog Next.js Guide](https://posthog.com/docs/integrate/nextjs)
- [PostHog Event Tracking](https://posthog.com/docs/integrate/client/js#event-tracking)
- [Session Replay Guide](https://posthog.com/docs/session-replay)
- [PostHog Dashboard](https://app.posthog.com)

---

## Support

If you encounter issues:

1. Check this guide first
2. Review `docs/POSTHOG_SETUP.md` for setup details
3. Check PostHog dashboard for event status
4. Review browser console for errors
5. Verify environment variables are set correctly

---

**Last Updated**: 2024-01-XX  
**Status**: ✅ PostHog is fully integrated and ready for new features
