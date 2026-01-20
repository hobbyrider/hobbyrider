# PostHog Integration Checklist

Quick reference checklist for ensuring PostHog works with new features.

## Pre-Development

- [ ] Review `docs/features/POSTHOG_DEVELOPER_GUIDE.md` for patterns and best practices
- [ ] Identify key user actions that need tracking
- [ ] Choose standardized event names (snake_case, descriptive)

## During Development

### Client Components

- [ ] Import PostHog functions: `import { trackEvent } from "@/lib/posthog"`
- [ ] Track user actions after successful operations
- [ ] Use standardized event names (see developer guide)
- [ ] Include relevant properties (no PII)
- [ ] Component has `"use client"` directive

### Server Actions

- [ ] Import server PostHog client: `import { getPostHogClient } from "@/lib/posthog-server"`
- [ ] Track server-side events with proper distinct_id
- [ ] Handle null case if PostHog client unavailable

## Testing

- [ ] **Local Testing**:
  - [ ] Environment variables set in `.env.local`
  - [ ] Events appear in PostHog dashboard
  - [ ] Session replay captures interactions
  - [ ] No console errors related to PostHog

- [ ] **Production Testing**:
  - [ ] Environment variables set in Vercel
  - [ ] Events appear in PostHog dashboard
  - [ ] Session replay works in production

## Documentation

- [ ] New event types documented in `docs/POSTHOG_DEVELOPER_GUIDE.md`
- [ ] Helper functions added to `lib/posthog.ts` if commonly used
- [ ] Event names added to "Standardized Event Names" table

## Verification

- [ ] All user-facing actions are tracked
- [ ] Event names follow snake_case convention
- [ ] Properties include relevant context
- [ ] No sensitive data (passwords, PII) in events
- [ ] Events tracked after success, not before
- [ ] Session replay captures feature interactions

## Common Mistakes to Avoid

- ❌ Forgetting to track user actions
- ❌ Using camelCase instead of snake_case for event names
- ❌ Tracking before actions complete (should track after success)
- ❌ Including sensitive data in event properties
- ❌ Not testing events in PostHog dashboard
- ❌ Importing PostHog directly instead of using `@/lib/posthog`

---

**Quick Reference**: See `docs/features/POSTHOG_DEVELOPER_GUIDE.md` for detailed examples and patterns.
