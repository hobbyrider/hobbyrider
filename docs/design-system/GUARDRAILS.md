# Design System Guardrails

This document defines rules and enforcement mechanisms to prevent design system drift.

## Rules

### 1. Component Usage

**Rule:** All UI elements must use shadcn components or approved extensions.

**Enforcement:**
- Code review checklist
- ESLint rules (see below)
- Pre-commit hooks (optional)

**Exceptions:**
- Highly specialized components (e.g., product gallery)
- Must be documented and approved

### 2. Color Usage

**Rule:** No hardcoded Tailwind color classes. Use CSS variables.

**Forbidden:**
- `text-gray-600`, `bg-gray-100`, `border-gray-200`
- Any direct color values

**Allowed:**
- `text-foreground`, `bg-background`, `border-border`
- `text-muted-foreground`, `bg-muted`
- Design token CSS variables

### 3. Variant System

**Rule:** Components must use `cva` for variants, not conditional className strings.

**Forbidden:**
```tsx
className={`base ${condition ? 'variant-a' : 'variant-b'}`}
```

**Allowed:**
```tsx
const variants = cva('base', {
  variants: { type: { a: '...', b: '...' } }
})
```

### 4. Mobile Responsiveness

**Rule:** All components must be mobile-responsive by default.

**Required:**
- Mobile-first approach
- Responsive breakpoints (`sm:`, `md:`, `lg:`)
- Touch-friendly hit areas (min 44x44px)

### 5. Accessibility

**Rule:** All interactive elements must be accessible.

**Required:**
- ARIA attributes where needed
- Keyboard navigation
- Focus states
- Screen reader support

---

## ESLint Rules

Add to `eslint.config.mjs`:

```javascript
{
  rules: {
    // Prevent hardcoded colors (warn only, not error)
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'Literal[value=/^(text|bg|border)-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+$/]',
        message: 'Use design tokens (text-foreground, bg-background, etc.) instead of hardcoded colors',
      },
    ],
  },
}
```

**Note:** This is a warning, not an error, to allow gradual migration.

---

## Code Review Checklist

Reviewers should check:

- [ ] Uses shadcn components
- [ ] No hardcoded colors
- [ ] Uses variants, not inline overrides
- [ ] Mobile responsive
- [ ] Accessible
- [ ] Follows patterns from usage guide

---

## Pre-commit Hooks (Optional)

Create `.husky/pre-commit`:

```bash
#!/bin/sh
# Check for hardcoded colors (warn only)
npm run lint:colors || true
```

---

## Documentation Requirements

New components must include:

1. **Purpose** - What it does
2. **Usage** - Code example
3. **Variants** - Available variants
4. **Props** - All props documented
5. **Accessibility** - ARIA attributes, keyboard nav

---

## Enforcement Levels

### Level 1: Documentation (Current)
- Rules documented
- Code review checklist
- Manual enforcement

### Level 2: Automated (Future)
- ESLint rules
- Pre-commit hooks
- CI checks

### Level 3: Strict (Future)
- Block merges that violate rules
- Automated refactoring suggestions
- Design system CI pipeline

---

## Migration Strategy

1. **Phase 1 (Now):** Documentation + manual review
2. **Phase 2 (Next):** ESLint warnings
3. **Phase 3 (Future):** ESLint errors + pre-commit hooks

---

## Questions?

If you're unsure whether something follows the design system:

1. Check `docs/design-system/USAGE_GUIDE.md`
2. Look at existing components in `components/ui/`
3. Ask in code review
4. When in doubt, use shadcn components
