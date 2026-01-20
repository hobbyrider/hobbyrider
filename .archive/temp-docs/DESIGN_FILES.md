# Design & Frontend Files Reference

This document lists all files that contain **purely design and frontend code** that can be safely copied, modified in a design tool/code editor, and pasted back for deployment.

## 🎨 Core Design System Files

### Global Styles & Design Tokens
- **`app/globals.css`** - Main CSS file with design tokens, color variables, spacing scale, and global styles
  - Contains: CSS custom properties (--variables), Tailwind imports, base styles
  - Safe to modify: Colors, spacing, typography scales, global styles

### Typography System
- **`app/components/typography.tsx`** - Typography components (PageTitle, SectionTitle, Text, Muted, etc.)
  - Contains: React components with Tailwind classes for text styles
  - Safe to modify: Font sizes, weights, line heights, tracking, colors

## 🧩 Reusable UI Components (Presentational)

### Layout Components
- **`app/components/site-header.tsx`** - Header/navigation bar
  - Contains: Logo, navigation links, search trigger, user menu
  - Safe to modify: Layout, spacing, colors, button styles

- **`app/components/site-footer.tsx`** - Footer section
  - Contains: Footer navigation, links, copyright text
  - Safe to modify: Layout, typography, spacing, colors

### Product Display Components
- **`app/components/feed-item-card.tsx`** - Product card on homepage
  - Contains: Product thumbnail, title, tagline, categories, action buttons
  - Safe to modify: Card layout, spacing, hover effects, button styles

- **`app/components/product-gallery.tsx`** - Image/screenshot gallery
  - Contains: Main image viewer, thumbnail strip, navigation arrows
  - Safe to modify: Gallery layout, thumbnail styling, navigation button styles

- **`app/components/product-gallery.tsx`** - Image/screenshot gallery
  - Contains: Main image viewer, thumbnail strip, navigation arrows
  - Safe to modify: Gallery layout, thumbnail styling, navigation button styles

### Navigation & Controls
- **`app/components/search-trigger.tsx`** - Search button in header
  - Contains: Search button/input-like trigger
  - Safe to modify: Button styling, icon, placeholder text style

- **`app/components/search-modal.tsx`** - Search modal/popup
  - Contains: Search input, results display, modal overlay
  - Safe to modify: Modal layout, input styling, results list styling

- **`app/components/filter-controls.tsx`** - Sort and filter buttons
  - Contains: Sort options, date filters, button groups
  - Safe to modify: Button styles, active states, layout

- **`app/components/pagination.tsx`** - Page navigation
  - Contains: Previous/Next buttons, page numbers
  - Safe to modify: Button styles, layout, spacing

### Action Buttons & Icons
- **`app/components/icons/`** - Icon components (SVG-based)
  - Files:
    - `upvote-icon.tsx` - Upvote chevron icon
    - `comment-icon.tsx` - Comment bubble icon
    - `copy-icon.tsx` - Copy/clipboard icon
    - `report-icon.tsx` - Flag/report icon
  - Safe to modify: SVG paths, colors, sizes

- **`app/(main)/product/[id]/product-actions.tsx`** - Action buttons in sidebar
  - Contains: Upvote, comment, copy URL, report buttons
  - Safe to modify: Button layout, styling, hover states, spacing

### Interactive Components
- **`app/components/report-button.tsx`** - Report button with modal
  - Contains: Button styling, modal form layout
  - Safe to modify: Button appearance, modal styling, form layout (keep form logic intact)

- **`app/components/user-menu.tsx`** - User dropdown menu
  - Contains: Avatar, dropdown menu, menu items
  - Safe to modify: Avatar styling, menu layout, dropdown positioning

## 📄 Page-Specific Styling

### Layout Pages (Structure + Styling)
These files contain both structure and styling. **Modify only className props and inline styles**:

- **`app/(main)/layout.tsx`** - Main layout wrapper
  - Safe to modify: Layout structure, wrapper classes, spacing

- **`app/layout.tsx`** - Root layout (font setup)
  - Safe to modify: Font configuration, HTML/body classes

### Page Components (Focus on className props)
- **`app/(main)/page.tsx`** - Homepage
  - Safe to modify: className props, spacing, layout classes (keep data fetching logic)

- **`app/(main)/product/[id]/page.tsx`** - Product detail page
  - Safe to modify: className props, grid layouts, spacing (keep data fetching)

- **`app/(main)/categories/page.tsx`** - Categories listing
  - Safe to modify: Grid layout, card styling, spacing

- **`app/(main)/category/[slug]/page.tsx`** - Category detail page
  - Safe to modify: Layout, spacing, typography classes

- **`app/(main)/pricing/page.tsx`** - Pricing page
  - Safe to modify: Card styling, layout, spacing, typography

- **`app/(main)/submit/page.tsx`** - Submit form page
  - Safe to modify: Form styling, input styling, button styles (keep form logic)

- **`app/(main)/search/page.tsx`** - Search results page
  - Safe to modify: Results list styling, layout, spacing

- **`app/(main)/login/page.tsx`** - Login page
  - Safe to modify: Form styling, layout, spacing (keep auth logic)

- **`app/(main)/signup/page.tsx`** - Signup page
  - Safe to modify: Form styling, layout, spacing (keep auth logic)

- **`app/(main)/privacy/page.tsx`** - Privacy policy page
  - Safe to modify: Typography, spacing, layout

- **`app/(main)/terms/page.tsx`** - Terms of service page
  - Safe to modify: Typography, spacing, layout

- **`app/(main)/builder/[username]/page.tsx`** - Builder profile page
  - Safe to modify: Profile layout, spacing, typography

- **`app/(main)/user/[id]/page.tsx`** - User profile page
  - Safe to modify: Profile layout, spacing, typography

### Form Components
- **`app/(main)/product/[id]/comment-form.tsx`** - Comment form
  - Safe to modify: Input styling, button styles, layout (keep form logic)

- **`app/(main)/product/[id]/comment-item.tsx`** - Comment display item
  - Safe to modify: Comment card styling, layout, spacing (keep edit/delete logic)

## ⚠️ Files to AVOID Modifying (Business Logic)

**Do NOT modify these files for design changes** - they contain critical functionality:

- `app/actions/*.ts` - Server actions (business logic)
- `app/api/*/route.ts` - API routes (backend logic)
- `lib/*.ts` - Utility functions and database logic
- `prisma/schema.prisma` - Database schema
- `next.config.ts` - Next.js configuration
- `package.json` - Dependencies
- Any file with complex state management or API calls

## 🎯 Quick Reference: Safe Design Modifications

### What to Modify:
✅ All `className` props in React components
✅ CSS custom properties in `globals.css`
✅ Tailwind utility classes
✅ SVG paths in icon components
✅ Spacing values (padding, margin, gap)
✅ Color values (text colors, backgrounds, borders)
✅ Typography classes (font sizes, weights, line heights)
✅ Layout classes (flex, grid, positioning)

### What NOT to Modify:
❌ Function logic and state management
❌ Event handlers (onClick, onSubmit, etc.)
❌ Data fetching code (async/await, database queries)
❌ Type definitions (unless adding new props)
❌ Import statements (unless adding new dependencies)
❌ Form validation logic
❌ Authentication logic
❌ API route handlers

## 📝 Workflow for Design Changes

1. **Copy** the relevant file(s) from the list above
2. **Modify** className props, colors, spacing, and layout classes
3. **Test** locally: `npm run dev`
4. **Verify** build: `npm run build`
5. **Commit** and push for deployment

## 🎨 Design System Variables (in globals.css)

Key CSS variables you can modify:
- `--background`, `--foreground` - Base colors
- `--color-gray-*` - Gray scale (50-900)
- `--spacing-*` - Spacing scale (xs to 3xl)
- `--font-size-*` - Typography scale (xs to 4xl)
- `--color-primary`, `--color-secondary` - Brand colors
- `--color-success`, `--color-error` - Status colors

These variables are used throughout the design system and can be safely changed.
