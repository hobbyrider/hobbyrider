# Design System Protection

## Overview

This document defines how the global design system is protected from accidental changes during feature development. The design system is the foundation of the entire application's visual identity and must remain stable and consistent.

## Protected Files

The following files are **CRITICAL** and should **NEVER** be modified unless explicitly requested:

### Core Design System Files

1. **`app/globals.css`**
   - Contains all design tokens (colors, spacing, typography, transitions)
   - Defines global CSS variables
   - Sets base styles for body, links, focus states
   - **DO NOT MODIFY** unless:
     - Explicitly requested by the user
     - Upgrading the global design system
     - Fixing critical bugs that break the design system

2. **`app/components/typography.tsx`**
   - Contains all typography components (PageTitle, SectionTitle, Text, etc.)
   - Enforces consistent typography across the app
   - **DO NOT MODIFY** unless:
     - Adding new typography components
     - Fixing bugs in existing components
     - Explicitly requested by the user

3. **`components/ui/*.tsx`** (shadcn/ui components)
   - Button, Badge, Input, Card, Dialog, Sheet, and other shadcn components
   - Configured to use light grey for buttons/selected states (not black)
   - **DO NOT MODIFY** unless:
     - Explicitly requested by the user
     - Fixing critical bugs
     - User explicitly approves the change
   - See `docs/architecture/SHADCN_DESIGN_SYSTEM.md` for details

4. **`lib/design-system.ts`** (if exists)
   - Design system utilities and constants
   - **DO NOT MODIFY** without explicit permission

## Design System Principles

### 1. Isolation
- New features must use existing design system components
- Do not add global CSS rules that affect the entire application
- Do not override design tokens without explicit permission

### 2. Component-First Approach
- Always use typography components from `app/components/typography.tsx`
- Use design tokens (CSS variables) for colors, spacing, etc.
- Follow existing patterns in the codebase

### 3. Scoped Styling
- New features should use scoped Tailwind classes
- Avoid global CSS changes
- Use component-level styling when possible

### 4. Mobile Responsiveness
- All new features must be mobile-responsive
- Use Tailwind responsive breakpoints: `sm:`, `lg:`, etc.
- Test on mobile viewports (320px - 640px)

## Rules for Feature Development

### ✅ DO:
- Use existing typography components
- Use design tokens (CSS variables) for colors and spacing
- Follow existing component patterns
- Make features mobile-responsive
- Test locally before deployment
- Use scoped Tailwind classes

### ❌ DON'T:
- Modify `app/globals.css` without explicit permission
- Add global CSS rules that affect the entire app
- Override design tokens
- Use direct Tailwind typography utilities (text-*, leading-*, etc.)
- Add new font families
- Change base link styles globally
- Add global list styles
- Use `prose` classes or similar that add default styles

## When to Modify the Design System

The design system should only be modified when:

1. **Explicit User Request**: User specifically asks to upgrade or change the design system
2. **Critical Bug Fix**: A bug in the design system is breaking functionality
3. **Design System Evolution**: Planned, documented design system upgrades

## Process for Design System Changes

If you need to modify the design system:

1. **Document the Change**: Explain why the change is needed
2. **Get Approval**: Ensure the user explicitly approves the change
3. **Test Thoroughly**: Test across all pages and components
4. **Update Documentation**: Update this document if needed

## Protected Patterns

### Typography
- **MUST** use components from `app/components/typography.tsx`
- **MUST NOT** use direct Tailwind typography utilities outside typography components

### Colors
- **MUST** use CSS variables from `:root` in `globals.css`
- **MUST NOT** hardcode colors (e.g., `#171717` should use `var(--color-gray-900)`)

### Spacing
- **MUST** use design tokens or Tailwind spacing scale
- **MUST NOT** use arbitrary values without justification

### Links
- **MUST** follow existing link patterns in the codebase
- **MUST NOT** add global link styles that affect all links

### Lists
- **MUST** style lists explicitly when needed
- **MUST NOT** add global list styles

## Examples of Protected Code

### ❌ Bad: Modifying Global Styles
```css
/* DON'T add this to globals.css without permission */
a {
  text-decoration: none;
  color: blue;
}

ul {
  list-style: disc;
}
```

### ❌ Bad: Modifying shadcn Components
```tsx
// DON'T change button to black without permission
const buttonVariants = cva({
  variants: {
    variant: {
      default: "bg-gray-900 text-white", // ❌ Wrong - should be light grey
    }
  }
})
```

### ✅ Good: Using Design System
```tsx
// Use typography components
<PageTitle>My Title</PageTitle>
<Text className="text-gray-700">My content</Text>

// Use design tokens
<div className="p-4 sm:p-6" style={{ color: 'var(--color-gray-900)' }}>
```

## Enforcement

This protection is enforced through:
1. **Cursor Rules**: `.cursorrules` file contains typography rules
2. **Code Review**: All changes to protected files should be reviewed
3. **Documentation**: This document serves as a reference

## Questions?

If you're unsure whether a change affects the design system:
1. Check if it modifies `app/globals.css`
2. Check if it adds global CSS rules
3. Check if it overrides design tokens
4. When in doubt, ask the user before making the change
