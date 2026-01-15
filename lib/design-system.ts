/**
 * Hobbyrider Design System
 * 
 * Centralized design tokens for consistent UI across the application.
 * These tokens define spacing, typography, colors, and component variants.
 */

// Spacing Scale (4px base unit)
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  base: '1rem',     // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const

// Typography Scale (refined for better hierarchy)
export const typography = {
  // Font sizes (refined scale)
  xs: '0.75rem',      // 12px - captions, labels, metadata
  sm: '0.875rem',     // 14px - secondary text, small descriptions
  base: '1rem',       // 16px - body text
  lg: '1.125rem',     // 18px - emphasized body, large descriptions
  xl: '1.25rem',      // 20px - small headings, card titles
  '2xl': '1.5rem',    // 24px - section headings
  '3xl': '1.875rem',  // 30px - page titles
  '4xl': '2.25rem',   // 36px - hero titles, product names
  '5xl': '3rem',      // 48px - display titles
  
  // Font weights (refined)
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  
  // Line heights (refined for readability)
  lineHeightTight: '1.25',      // Headings
  lineHeightSnug: '1.375',      // Subheadings
  lineHeightNormal: '1.5',     // Body text
  lineHeightRelaxed: '1.625',   // Long-form content
  lineHeightLoose: '2',         // Spacious content
  
  // Letter spacing (refined)
  letterSpacingTighter: '-0.025em',  // Large headings
  letterSpacingTight: '-0.01em',     // Medium headings
  letterSpacingNormal: '0',          // Body text
  letterSpacingWide: '0.025em',      // Uppercase labels
  letterSpacingWider: '0.05em',      // Display text
} as const

// Color Palette (semantic tokens)
export const colors = {
  // Primary grays (refined for better contrast)
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  
  // Semantic colors
  primary: {
    DEFAULT: '#171717',      // Primary text/actions
    hover: '#000000',
    light: '#404040',
    muted: '#737373',
  },
  
  secondary: {
    DEFAULT: '#737373',      // Secondary text
    hover: '#525252',
    light: '#a3a3a3',
    dark: '#404040',
  },
  
  accent: {
    DEFAULT: '#171717',       // Accent color (can be customized)
    hover: '#000000',
    light: '#404040',
  },
  
  // Status colors (refined)
  success: {
    DEFAULT: '#16a34a',       // Green for upvoted state
    light: '#dcfce7',
    dark: '#15803d',
    border: '#86efac',
  },
  
  error: {
    DEFAULT: '#dc2626',
    light: '#fee2e2',
    dark: '#b91c1c',
  },
  
  // Interactive states
  interactive: {
    hover: '#f5f5f5',
    active: '#e5e5e5',
    focus: '#171717',
  },
  
  // Backgrounds
  background: {
    DEFAULT: '#ffffff',
    secondary: '#fafafa',
    tertiary: '#f5f5f5',
    elevated: '#ffffff',
  },
  
  // Borders (refined)
  border: {
    DEFAULT: '#e5e5e5',
    light: '#f5f5f5',
    medium: '#d4d4d4',
    dark: '#a3a3a3',
    focus: '#171717',
  },
} as const

// Border Radius
export const radius = {
  sm: '0.375rem',    // 6px
  base: '0.5rem',    // 8px
  md: '0.75rem',     // 12px
  lg: '1rem',        // 16px
  xl: '1.5rem',      // 24px
  full: '9999px',
} as const

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const

// Transitions
export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  easing: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

// Component Variants (refined for polish)
export const componentVariants = {
  button: {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-900 transition-colors',
    secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors',
    success: 'bg-green-50 border border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400 transition-colors',
    outline: 'border-2 border-gray-300 text-gray-900 hover:border-gray-900 hover:bg-gray-50 transition-colors',
  },
  card: {
    default: 'bg-white border border-gray-200 rounded-xl',
    hover: 'bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200',
    elevated: 'bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow',
    interactive: 'bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all duration-200',
  },
  chip: {
    default: 'px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium',
    hover: 'px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors',
    active: 'px-2.5 py-1 rounded-full bg-gray-900 text-white text-xs font-medium',
  },
  input: {
    default: 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 transition-colors',
    search: 'w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-500 focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 transition-all',
  },
} as const

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const
