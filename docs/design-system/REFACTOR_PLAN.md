# Design System Refactoring Plan

This document outlines the step-by-step plan to transform the codebase into a proper shadcn/ui-based design system.

## Phase 1: Foundation (Week 1)

### 1.1 Add Missing shadcn Components
```bash
npx shadcn@latest add select
npx shadcn@latest add popover
npx shadcn@latest add tooltip
npx shadcn@latest add tabs
npx shadcn@latest add skeleton
npx shadcn@latest add separator
```

### 1.2 Create Component Index
Create `components/ui/index.ts` to export all components:
```typescript
export * from './button'
export * from './card'
export * from './dialog'
// ... etc
```

### 1.3 Standardize Imports
Update all imports to use `@/components/ui` consistently.

### 1.4 Create Tailwind Config (if needed)
If using Tailwind v4, ensure CSS variables are properly integrated.

---

## Phase 2: Component Refactoring (Week 2)

### 2.1 Refactor UpvoteButton
**Current:** Custom button with inline Tailwind  
**Target:** Use `Button` component with variants

**Changes:**
- Create `upvote` variant in Button component
- Use `Button` instead of `<button>`
- Remove inline styles

### 2.2 Refactor SearchModal
**Current:** Custom dialog implementation  
**Target:** Use `Dialog` component from shadcn

**Changes:**
- Replace custom modal with `Dialog`, `DialogContent`, `DialogTitle`
- Use shadcn styling
- Maintain existing functionality

### 2.3 Refactor UserMenu
**Current:** Custom dropdown  
**Target:** Use `DropdownMenu` component

**Changes:**
- Replace with `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`
- Use shadcn styling

### 2.4 Refactor DeleteConfirm
**Current:** Custom dialog  
**Target:** Use `Dialog` component

---

## Phase 3: Design Tokens (Week 3)

### 3.1 Replace Hardcoded Colors
Replace all instances of:
- `text-gray-600` → `text-muted-foreground`
- `bg-gray-100` → `bg-secondary`
- `border-gray-200` → `border-border`
- `text-gray-900` → `text-foreground`

### 3.2 Create Utility Classes
Add to `globals.css`:
```css
.text-muted { @apply text-muted-foreground; }
.bg-muted { @apply bg-muted; }
.border-default { @apply border-border; }
```

### 3.3 Standardize Spacing
Use spacing scale consistently:
- `gap-2` → `gap-2` (8px) - tight
- `gap-4` → `gap-4` (16px) - default
- `gap-6` → `gap-6` (24px) - loose

---

## Phase 4: Variants & Extensibility (Week 4)

### 4.1 Add Button Variants
Extend Button with:
- `loading` variant (with spinner)
- `success` variant (green)
- `warning` variant (yellow)
- `icon` size variant

### 4.2 Add Badge Variants
Extend Badge with:
- `success` variant
- `warning` variant
- `info` variant

### 4.3 Create Component Variants
Add variants to:
- `Card` (elevated, outlined, flat)
- `Input` (sizes: sm, md, lg)
- Custom components

---

## Phase 5: Mobile & Accessibility (Week 5)

### 5.1 Standardize Breakpoints
Document and enforce:
- `sm:` = 640px (mobile landscape)
- `md:` = 768px (tablet)
- `lg:` = 1024px (desktop)

### 5.2 Add Missing ARIA
- Add `aria-label` to all interactive elements
- Add `role` attributes where needed
- Ensure keyboard navigation

### 5.3 Test Accessibility
- Run accessibility audit
- Test with screen readers
- Verify keyboard navigation

---

## Phase 6: Documentation & Guardrails (Week 6)

### 6.1 Create Design System Docs
- Component usage guide
- Design tokens reference
- Variant documentation
- Examples and patterns

### 6.2 Add ESLint Rules
Prevent:
- Inline Tailwind color classes
- Direct style overrides
- Non-shadcn components for common patterns

### 6.3 Create Contribution Guide
- How to add new components
- When to extend vs create new
- Style guide

---

## Implementation Order

1. **Start with high-impact components** (UpvoteButton, SearchModal)
2. **Work incrementally** - One component at a time
3. **Test thoroughly** - Ensure no regressions
4. **Document as you go** - Update docs with each change

---

## Success Criteria

✅ All UI components use shadcn or extend it  
✅ No hardcoded colors (use CSS variables)  
✅ All components have variants  
✅ Mobile responsive by default  
✅ Accessible (ARIA, keyboard nav)  
✅ Documented and maintainable  
