# Design System Quick Reference

Quick reference for using the design system in daily development.

## Import Components

```tsx
// From centralized index
import { Button, Card, Dialog, Badge } from '@/components/ui'

// Or directly
import { Button } from '@/components/ui/button'
```

## Common Patterns

### Buttons

```tsx
<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Tertiary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="upvote">Upvote</Button>
<Button variant="upvoted">Upvoted</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Colors (Design Tokens)

```tsx
// ✅ DO
className="text-foreground bg-background border-border"
className="text-muted-foreground bg-muted"
className="text-primary bg-primary"

// ❌ DON'T
className="text-gray-900 bg-white border-gray-200"
```

### Dialogs/Modals

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Description</DialogDescription>
    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>Cancel</Button>
      <Button variant="destructive" onClick={onConfirm}>Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Dropdowns

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Conditional Classes

```tsx
import { cn } from '@/lib/utils'

<Button className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes"
)}>
```

## Mobile Responsiveness

Always use responsive breakpoints:
- `sm:` = 640px
- `md:` = 768px  
- `lg:` = 1024px

```tsx
<div className="flex flex-col sm:flex-row gap-4">
  <div className="w-full sm:w-1/2">Content</div>
</div>
```

## Accessibility

- Use semantic HTML
- Add `aria-label` when needed
- Use Radix primitives (they handle accessibility)
- Ensure keyboard navigation works

## Need Help?

- Check `docs/design-system/USAGE_GUIDE.md` for detailed patterns
- Look at existing components in `components/ui/`
- Review refactored components for examples
