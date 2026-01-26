# Design System Usage Guide

This guide ensures all future development uses the shadcn/ui design system consistently.

## Core Principles

1. **Always use shadcn components** - Don't create custom buttons, dialogs, or inputs
2. **Extend with variants** - Use `cva` to add variants, don't override styles
3. **Use design tokens** - Use CSS variables, not hardcoded colors
4. **Mobile-first** - All components must be responsive by default
5. **Accessible by default** - Use Radix primitives, add ARIA attributes

---

## Component Usage

### Buttons

**✅ DO:**
```tsx
import { Button } from '@/components/ui'

<Button variant="default" size="sm">Click me</Button>
<Button variant="outline">Secondary</Button>
<Button variant="destructive">Delete</Button>
```

**❌ DON'T:**
```tsx
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Click me
</button>
```

### Cards

**✅ DO:**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Dialogs/Modals

**✅ DO:**
```tsx
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui'

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogTitle>Title</DialogTitle>
    Content here
  </DialogContent>
</Dialog>
```

**❌ DON'T:**
```tsx
<div className="fixed inset-0 bg-black/50">
  <div className="bg-white rounded-lg p-4">
    Modal content
  </div>
</div>
```

---

## Design Tokens

### Colors

**✅ DO:**
```tsx
className="text-foreground bg-background border-border"
className="text-muted-foreground bg-muted"
className="text-primary bg-primary"
```

**❌ DON'T:**
```tsx
className="text-gray-900 bg-white border-gray-200"
className="text-gray-600 bg-gray-100"
```

### Spacing

Use consistent spacing scale:
- `gap-2` (8px) - Tight spacing
- `gap-4` (16px) - Default spacing
- `gap-6` (24px) - Loose spacing

### Border Radius

Use design tokens:
- `rounded-sm` (6px)
- `rounded-md` (8px) - Default
- `rounded-lg` (12px)
- `rounded-xl` (16px)

---

## Extending Components

### Adding Variants

**✅ DO:**
```tsx
// In button.tsx
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "...",
        custom: "bg-custom text-custom-foreground", // Add new variant
      },
    },
  }
)
```

**❌ DON'T:**
```tsx
<Button className="bg-custom text-white">Custom</Button> // Override styles
```

### Creating New Components

If you need a new component:

1. **Check if shadcn has it** - Run `npx shadcn@latest add [component]`
2. **Extend existing** - Add variants to existing components
3. **Create new only if necessary** - Use `cva` for variants, follow shadcn patterns

---

## Mobile Responsiveness

### Breakpoints

- `sm:` = 640px (mobile landscape)
- `md:` = 768px (tablet)
- `lg:` = 1024px (desktop)

### Patterns

**✅ DO:**
```tsx
<div className="flex flex-col sm:flex-row gap-4">
  <div className="w-full sm:w-1/2">Content</div>
</div>
```

**❌ DON'T:**
```tsx
<div className="flex-row"> {/* Breaks on mobile */}
  <div className="w-1/2">Content</div>
</div>
```

---

## Accessibility

### Required Attributes

- **Buttons**: `aria-label` if no visible text
- **Dialogs**: `aria-labelledby`, `aria-describedby`
- **Forms**: `aria-label` or `<Label>` components
- **Interactive elements**: Keyboard navigation support

### Focus States

All interactive elements must have visible focus states:
```tsx
className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
```

---

## Common Patterns

### Form Inputs

```tsx
import { Input, Label } from '@/components/ui'

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

### Dropdowns

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui'

<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Loading States

```tsx
<Button disabled={isLoading}>
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

---

## Checklist for New Features

Before submitting code, ensure:

- [ ] Uses shadcn components (or extends them)
- [ ] Uses design tokens (CSS variables)
- [ ] Mobile responsive
- [ ] Accessible (ARIA, keyboard nav)
- [ ] Uses variants, not inline overrides
- [ ] Follows existing patterns
- [ ] Tested on mobile viewport

---

## Getting Help

- Check `components/ui/` for available components
- See `docs/design-system/AUDIT.md` for current state
- Review `docs/design-system/REFACTOR_PLAN.md` for patterns
- Ask if unsure - consistency is more important than speed
