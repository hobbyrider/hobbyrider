# PART 5 — Frontend Design System and UI Architecture

**Previous:** [Data Model ←](04-DATA-MODEL.md) | **Next:** [Limitations & Risks →](06-LIMITATIONS-RISKS.md)

## Design Implementation: Tailwind CSS v4

**What's used:** Tailwind CSS v4 with utility classes.

**Location:**
- Configuration: `postcss.config.mjs`
- Global styles: `app/globals.css`
- Design tokens: `lib/design-system.ts` (reference only, not actively used)

**CSS Architecture:**
```css
/* app/globals.css */
@import "tailwindcss";

:root {
  --color-primary: #171717;
  --color-gray-900: #171717;
  /* ... design system variables */
}
```

**Design tokens:** Defined in `lib/design-system.ts` (200 lines) but not actively used in components. Components use Tailwind utility classes directly.

**Example component styling:**
```typescript
// app/components/feed-item-card.tsx
<Card className="group transition-all duration-200 hover:shadow-sm">
  <CardContent className="p-4 sm:p-5">
    {/* Tailwind utilities directly */}
  </CardContent>
</Card>
```

**Custom components:** shadcn/ui components in `components/ui/` (button, card, dialog, etc.).

**Responsive design:**
- Breakpoints: `sm:`, `md:`, `lg:` used throughout
- Mobile-first approach
- Components are responsive (e.g., `flex-col sm:flex-row`)

**Accessibility:**
- Skip link in main layout: `app/(main)/layout.tsx` line 27-32
- Semantic HTML used
- ARIA labels on interactive elements
- Keyboard navigation support (search modal)

**Gaps:**
- No dark mode implementation (despite CSS variables)
- Limited focus state styling
- No screen reader testing documented

## Component Structure

### Reusable Primitives

**Location:** `components/ui/` and `app/components/`

**shadcn/ui components:**
- `components/ui/button.tsx` - Button component
- `components/ui/card.tsx` - Card container
- `components/ui/dialog.tsx` - Modal dialogs
- `components/ui/badge.tsx` - Badge component

**Custom reusable components:**
- `app/components/feed-item-card.tsx` - Product card (used in feed)
- `app/components/upvote-button.tsx` - Upvote button (used everywhere)
- `app/components/pagination.tsx` - Pagination controls
- `app/components/filter-controls.tsx` - Filter/sort UI
- `app/components/in-app-browser-gate.tsx` - In-app browser detection

### Page-Specific Components

- `app/(main)/product/[id]/comment-form.tsx` - Comment form (product page only)
- `app/(main)/product/[id]/comment-item.tsx` - Comment display (product page only)
- `app/(main)/user/[id]/product-list.tsx` - User's products list (profile page only)

### Layout Components

- `app/components/site-header.tsx` - Global header (navigation, search, user menu)
- `app/components/site-footer.tsx` - Global footer (links, copyright)
- `app/components/auth-provider.tsx` - NextAuth SessionProvider wrapper

## Performance Hotspots in UI

### 1. Image Loading

**Current implementation:**
```typescript
// app/components/feed-item-card.tsx
<Image
  src={item.thumbnail}
  alt={item.name}
  fill
  loading="lazy"
  sizes="(max-width: 640px) 56px, 64px"
/>
```

**Performance considerations:**
- Next.js Image component with `loading="lazy"`
- Images served from Vercel Blob (CDN)
- No image optimization in dev (`unoptimized: true` in `next.config.ts`)

**Potential issues:**
- Large images not resized
- No WebP conversion
- No responsive image sizes (single size per image)

### 2. Large Lists (Homepage Feed)

**Current implementation:**
- Renders 20 items per page (pagination)
- Each item is a `<FeedItemCard>` component
- No virtualization (could be slow with many items)

**Code:**
```typescript
// app/(main)/page.tsx
{paginatedProducts.map((item) => (
  <FeedItemCard key={item.id} item={item} hasUpvoted={...} isLoggedIn={...} />
))}
```

**Performance consideration:** With 20 items, performance is fine. For 100+ items, consider virtualization (e.g., `react-window`).

### 3. Hydration

**Current state:** Mix of Server and Client Components.

- Server Components (default): `app/(main)/page.tsx`, `app/(main)/product/[id]/page.tsx`
- Client Components: `"use client"` in interactive components (buttons, forms, modals)

**Potential issues:**
- No obvious hydration mismatches
- Client Components hydrate on client (expected)

---

**Previous:** [Data Model ←](04-DATA-MODEL.md) | **Next:** [Limitations & Risks →](06-LIMITATIONS-RISKS.md)
