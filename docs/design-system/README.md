# Design System Documentation

This directory contains all documentation for the shadcn/ui-based design system.

## Quick Links

- **[AUDIT.md](./AUDIT.md)** - Current state audit and findings
- **[REFACTOR_PLAN.md](./REFACTOR_PLAN.md)** - Step-by-step refactoring plan
- **[USAGE_GUIDE.md](./USAGE_GUIDE.md)** - How to use the design system
- **[GUARDRAILS.md](./GUARDRAILS.md)** - Rules and enforcement mechanisms

## Current Status

**Status:** ⚠️ Partial Implementation

shadcn/ui is installed and configured, but the codebase shows **partial adoption** with style drift. Many components use inline Tailwind classes instead of shadcn components.

### What's Working ✅
- shadcn/ui installed correctly
- Base components available (`Button`, `Card`, `Dialog`, `Sheet`, `Badge`)
- Design tokens defined in CSS
- Some components already using shadcn

### What Needs Work ❌
- Many components use inline styles instead of shadcn
- Hardcoded colors instead of design tokens
- Missing variant systems
- Inconsistent mobile responsiveness
- No enforcement mechanisms

## Next Steps

1. **Read the audit** - Understand current state
2. **Follow the refactor plan** - Systematic improvements
3. **Use the usage guide** - For all new development
4. **Follow guardrails** - Prevent future drift

## For New Features

**Before writing any UI code:**

1. Check `USAGE_GUIDE.md` for patterns
2. Use shadcn components from `components/ui/`
3. Use design tokens (CSS variables)
4. Ensure mobile responsiveness
5. Add accessibility attributes

## Questions?

- Check the usage guide first
- Look at existing shadcn components
- Ask in code review if unsure

---

**Remember:** Consistency is more important than speed. Use the design system.
