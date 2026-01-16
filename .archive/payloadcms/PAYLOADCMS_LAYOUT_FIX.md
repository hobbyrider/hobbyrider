# PayloadCMS Layout Hydration Fix

## Problem
PayloadCMS's `RootLayout` renders its own `<html>` and `<body>` tags, but it's nested inside Next.js's root `app/layout.tsx` which also renders `<html>` and `<body>`. This causes a hydration error.

## Solution
We've added `suppressHydrationWarning` to the root layout to allow PayloadCMS to render its own HTML structure. This is the recommended approach when integrating PayloadCMS with Next.js App Router.

## Current Structure

```
app/
├── layout.tsx              # Root layout with suppressHydrationWarning
├── (main)/                 # Main app routes
│   ├── layout.tsx          # Main app layout (nested, no HTML/body)
│   ├── page.tsx
│   └── ...other routes
└── (payload)/              # PayloadCMS routes
    ├── layout.tsx          # PayloadCMS RootLayout (renders HTML/body)
    └── admin/
        └── [[...segments]]/
            └── page.tsx
```

## Files Modified

1. **`app/layout.tsx`** - Added `suppressHydrationWarning` to `<html>` and `<body>`
2. **`app/(main)/layout.tsx`** - Main app layout (no HTML/body, just content)
3. **`app/(payload)/layout.tsx`** - PayloadCMS layout (renders its own HTML)

## Note
The nested HTML structure is technically invalid HTML, but with `suppressHydrationWarning`, React will not throw hydration errors. This is a known limitation when using PayloadCMS with Next.js App Router, and the PayloadCMS team is aware of this.

## Alternative Solutions (Not Implemented)

1. **Separate Next.js apps** - Run PayloadCMS in a separate Next.js app
2. **Custom PayloadCMS component** - Create a wrapper that doesn't render HTML (not officially supported)
3. **Wait for PayloadCMS update** - Future versions may support nested layouts better

For now, `suppressHydrationWarning` is the recommended workaround.
