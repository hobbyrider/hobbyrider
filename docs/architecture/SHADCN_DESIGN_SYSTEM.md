# shadcn/ui Design System Configuration

## Overview

This document describes the shadcn/ui component configuration and design system alignment for the hobbyrider project.

## Design Philosophy

The design system uses a **light grey** color scheme for interactive elements (buttons, badges, selected states) rather than black/dark colors. This creates a softer, more approachable visual aesthetic.

## Component Configurations

### Button Component (`components/ui/button.tsx`)

**Default Variant:**
- Background: `bg-gray-100` (light grey)
- Text: `text-gray-900` (dark text)
- Border: `border-gray-300`
- Hover: `hover:bg-gray-200 hover:border-gray-400`

**Key Principle:** Buttons should be light grey by default, not black. This applies to:
- Primary action buttons
- Selected/active filter buttons
- Pagination active states
- Any button that represents a selected or default state

### Badge Component (`components/ui/badge.tsx`)

**Default Variant:**
- Background: `bg-gray-100` (light grey)
- Text: `text-gray-900` (dark text)
- Hover: `hover:bg-gray-200`

### CSS Variables (`app/globals.css`)

**Primary Color:**
- Light mode: `--primary: 0 0% 96.1%` (gray-100) - Light grey for buttons/selected states
- Dark mode: `--primary: 0 0% 14.9%` (darker gray) - Appropriate for dark mode

**Primary Foreground:**
- Light mode: `--primary-foreground: 0 0% 9.4%` (gray-900) - Dark text on light background
- Dark mode: `--primary-foreground: 0 0% 93%` - Light text on dark background

## Link Styling

**Global Link Rules:**
- Links have **no underline by default** (`text-decoration: none`)
- Links inherit text color (`color: inherit`)
- Underlines only appear when explicitly requested via `hover:underline` or `underline` classes

## Protected Components

The following shadcn/ui components are **PROTECTED** and should not be modified unless explicitly requested:

- `components/ui/button.tsx`
- `components/ui/badge.tsx`
- `components/ui/input.tsx`
- `components/ui/card.tsx`
- `components/ui/dialog.tsx`
- `components/ui/sheet.tsx`
- All other components in `components/ui/`

## Usage Guidelines

### When to Use shadcn Components

1. **Use Button component** for all interactive buttons
2. **Use Badge component** for status indicators, tags, labels
3. **Use Input component** for form inputs
4. **Use Card component** for content containers

### When NOT to Modify

- **DO NOT** change button default variant to black/dark colors
- **DO NOT** modify CSS variables without explicit permission
- **DO NOT** add global styles that override shadcn component styles
- **DO NOT** use `bg-gray-900` or `bg-black` for default/selected button states

### Correct Patterns

✅ **Good:**
```tsx
<Button variant="default">Click me</Button> // Light grey background
<Button variant="outline">Outline</Button> // White with border
```

❌ **Bad:**
```tsx
<Button className="bg-gray-900 text-white">Click me</Button> // Black - don't do this
```

## Design System Alignment

All shadcn components are aligned with the global design system defined in `app/globals.css`:

- Colors use CSS variables (`--primary`, `--foreground`, etc.)
- Spacing follows the design system scale
- Typography uses Inter font (set globally)
- Border radius follows design system tokens
- Transitions use design system timing

## Future Changes

If you need to modify shadcn components:

1. **Get explicit approval** from the user
2. **Document the change** in this file
3. **Test thoroughly** across all pages
4. **Update protection rules** if needed

## Related Documentation

- `docs/architecture/DESIGN_SYSTEM_PROTECTION.md` - General design system protection
- `app/globals.css` - CSS variables and global styles
- `.cursorrules` - Cursor rules including design system protection
