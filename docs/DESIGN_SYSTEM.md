# Hobbyrider Design System

**Current Design Tokens - Fonts & Colors**

---

## 🎨 Typography

### Primary Font: **Inter**

**Source:** Google Fonts (via Next.js Font Optimization)

**Implementation:**
```typescript
// app/layout.tsx
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})
```

**Font Stack:**
```css
--font-sans: var(--font-inter), ui-sans-serif, system-ui, -apple-system, 
  Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"
```

**Monospace Font Stack:**
```css
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
```

### Typography Scale

| Size | Variable | Pixels | Usage |
|------|----------|--------|-------|
| XS | `--font-size-xs` | 12px | Small labels, captions |
| SM | `--font-size-sm` | 14px | Secondary text, helper text |
| Base | `--font-size-base` | 16px | Body text (default) |
| LG | `--font-size-lg` | 18px | Emphasized text |
| XL | `--font-size-xl` | 20px | Subheadings |
| 2XL | `--font-size-2xl` | 24px | Section headings |
| 3XL | `--font-size-3xl` | 30px | Page titles |
| 4XL | `--font-size-4xl` | 36px | Hero titles |

**Line Height:** 1.5 (default)

---

## 🎨 Color Palette

### Primary Colors

| Color | Hex | Variable | Usage |
|-------|-----|----------|-------|
| **Primary** | `#171717` | `--color-primary` | Main text, buttons, links |
| **Primary Hover** | `#000000` | `--color-primary-hover` | Hover states |
| **Background** | `#FFFFFF` | `--background` | Page background (light mode) |
| **Background (Dark)** | `#0A0A0A` | `--background` | Page background (dark mode) |
| **Foreground** | `#171717` | `--foreground` | Text color (light mode) |
| **Foreground (Dark)** | `#EDEDED` | `--foreground` | Text color (dark mode) |

### Gray Scale

| Color | Hex | Variable | Usage |
|-------|-----|----------|-------|
| Gray 50 | `#FAFAFA` | `--color-gray-50` | Subtle backgrounds |
| Gray 100 | `#F5F5F5` | `--color-gray-100` | Light backgrounds, hover states |
| Gray 200 | `#E5E5E5` | `--color-gray-200` | Borders, dividers |
| Gray 300 | `#D4D4D4` | `--color-gray-300` | Disabled states |
| Gray 400 | `#A3A3A3` | `--color-gray-400` | Placeholder text |
| Gray 500 | `#737373` | `--color-gray-500` | Secondary text, muted |
| Gray 600 | `#525252` | `--color-gray-600` | Secondary text hover |
| Gray 700 | `#404040` | `--color-gray-700` | Darker secondary text |
| Gray 800 | `#262626` | `--color-gray-800` | Very dark text |
| Gray 900 | `#171717` | `--color-gray-900` | Primary text, headings |

### Semantic Colors

#### Success
- **Success:** `#16A34A` (`--color-success`)
- **Success Light:** `#DCFCE7` (`--color-success-light`)

#### Error
- **Error:** `#DC2626` (`--color-error`)
- **Error Light:** `#FEE2E2` (`--color-error-light`)

#### Secondary
- **Secondary:** `#737373` (`--color-secondary`) - Gray 500
- **Secondary Hover:** `#525252` (`--color-secondary-hover`) - Gray 600

### Border Colors

| Color | Hex | Variable | Usage |
|-------|-----|----------|-------|
| Border | `#E5E5E5` | `--color-border` | Default borders (gray-200) |
| Border Light | `#F5F5F5` | `--color-border-light` | Subtle borders (gray-100) |
| Border Medium | `#D4D4D4` | `--color-border-medium` | Medium borders (gray-300) |

---

## 🎨 Component Colors (shadcn/ui Variables)

### Light Mode

| Token | HSL | Hex Equivalent | Usage |
|-------|-----|----------------|-------|
| `--background` | `0 0% 100%` | `#FFFFFF` | Background |
| `--foreground` | `0 0% 9.4%` | `#171717` | Text |
| `--card` | `0 0% 100%` | `#FFFFFF` | Card background |
| `--card-foreground` | `0 0% 9.4%` | `#171717` | Card text |
| `--popover` | `0 0% 100%` | `#FFFFFF` | Popover background |
| `--popover-foreground` | `0 0% 9.4%` | `#171717` | Popover text |
| `--primary` | `0 0% 9.4%` | `#171717` | Primary actions |
| `--primary-foreground` | `0 0% 98%` | `#FAFAFA` | Primary text |
| `--secondary` | `0 0% 96.1%` | `#F5F5F5` | Secondary elements |
| `--secondary-foreground` | `0 0% 9.4%` | `#171717` | Secondary text |
| `--muted` | `0 0% 96.1%` | `#F5F5F5` | Muted backgrounds |
| `--muted-foreground` | `0 0% 45.1%` | `#737373` | Muted text |
| `--accent` | `0 0% 96.1%` | `#F5F5F5` | Accent elements |
| `--accent-foreground` | `0 0% 9.4%` | `#171717` | Accent text |
| `--destructive` | `0 84.2% 60.2%` | `#DC2626` | Error/delete actions |
| `--destructive-foreground` | `0 0% 98%` | `#FAFAFA` | Destructive text |
| `--border` | `0 0% 89.8%` | `#E5E5E5` | Borders |
| `--input` | `0 0% 89.8%` | `#E5E5E5` | Input borders |
| `--ring` | `0 0% 9.4%` | `#171717` | Focus ring |

### Dark Mode

| Token | HSL | Hex Equivalent | Usage |
|-------|-----|----------------|-------|
| `--background` | `0 0% 3.9%` | `#0A0A0A` | Background |
| `--foreground` | `0 0% 93%` | `#EDEDED` | Text |
| `--card` | `0 0% 3.9%` | `#0A0A0A` | Card background |
| `--card-foreground` | `0 0% 93%` | `#EDEDED` | Card text |
| `--primary` | `0 0% 93%` | `#EDEDED` | Primary actions |
| `--primary-foreground` | `0 0% 3.9%` | `#0A0A0A` | Primary text |
| `--secondary` | `0 0% 14.9%` | `#262626` | Secondary elements |
| `--border` | `0 0% 14.9%` | `#262626` | Borders |

---

## 📐 Border Radius

| Size | Variable | Pixels | Usage |
|------|----------|--------|-------|
| SM | `--radius-sm` | 6px | Small elements |
| Base | `--radius-base` | 8px | Default (buttons, cards) |
| MD | `--radius-md` | 12px | Medium elements |
| LG | `--radius-lg` | 16px | Large elements |
| XL | `--radius-xl` | 24px | Extra large elements |

**Default:** `0.5rem` (8px)

---

## ⏱️ Transitions

| Duration | Variable | Value | Usage |
|----------|----------|-------|-------|
| Fast | `--transition-fast` | 150ms | Quick interactions |
| Base | `--transition-base` | 200ms | Default transitions |
| Slow | `--transition-slow` | 300ms | Slow animations |

**Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (`--transition-easing`)

---

## 📏 Spacing Scale

Based on 4px base unit:

| Size | Variable | Pixels | Usage |
|------|----------|--------|-------|
| XS | `--spacing-xs` | 4px | Tight spacing |
| SM | `--spacing-sm` | 8px | Small spacing |
| MD | `--spacing-md` | 12px | Medium spacing |
| Base | `--spacing-base` | 16px | Default spacing |
| LG | `--spacing-lg` | 24px | Large spacing |
| XL | `--spacing-xl` | 32px | Extra large spacing |
| 2XL | `--spacing-2xl` | 48px | Section spacing |
| 3XL | `--spacing-3xl` | 64px | Page spacing |

---

## 🎨 Common Color Combinations

### Buttons

**Primary Button:**
- Background: `#171717` (gray-900)
- Text: White
- Hover: `#000000` (black)

**Secondary Button:**
- Background: `#F5F5F5` (gray-100)
- Text: `#171717` (gray-900)
- Hover: `#E5E5E5` (gray-200)

**Success Button:**
- Background: `#16A34A` (green)
- Text: White

**Error/Destructive Button:**
- Background: `#DC2626` (red)
- Text: White

### Cards & Surfaces

**Card Background:**
- Light: White (`#FFFFFF`)
- Dark: `#0A0A0A`

**Card Border:**
- `#E5E5E5` (gray-200)

**Header Background:**
- White with 95% opacity + backdrop blur
- Border: `#E5E5E5` (gray-200)

### Text Hierarchy

**Primary Text:**
- `#171717` (gray-900)

**Secondary Text:**
- `#737373` (gray-500)

**Muted Text:**
- `#A3A3A3` (gray-400)

**Link Text:**
- `#171717` (gray-900)
- Hover: `#000000` (black)

---

## 🌙 Dark Mode Support

Hobbyrider has **full dark mode support** using CSS media queries:

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode colors automatically applied */
  }
}
```

All colors automatically switch based on user's system preference.

---

## 📝 Usage Examples

### In Components

```tsx
// Using Tailwind classes (most common)
<div className="bg-white text-gray-900 border border-gray-200">
  <h1 className="text-2xl font-semibold text-gray-900">Title</h1>
  <p className="text-gray-600">Secondary text</p>
</div>

// Using CSS variables directly
<div style={{ 
  backgroundColor: 'var(--background)',
  color: 'var(--foreground)',
  borderColor: 'var(--border)'
}}>
  Content
</div>
```

### Typography Components

Use typography components from `app/components/typography.tsx` for consistent text styling:
- `PageTitle`
- `SectionTitle`
- `CardTitle`
- `Text`
- `Muted`
- `Small`

---

## 🎨 Brand Identity

**Color Philosophy:**
- **Monochromatic palette** - Primarily grayscale for clean, professional look
- **Black/White contrast** - High contrast for readability and accessibility
- **Minimal accent colors** - Green for success, red for errors only
- **No primary brand color** - Focuses on content, not branding

**Typography Philosophy:**
- **Inter font** - Modern, readable, widely supported
- **Clear hierarchy** - Distinct size scale for information architecture
- **Accessible** - WCAG AA compliant contrast ratios

---

## 📚 Reference Files

- **CSS Variables:** `app/globals.css`
- **Font Configuration:** `app/layout.tsx`
- **Typography Components:** `app/components/typography.tsx`

---

**Last Updated:** January 2025
