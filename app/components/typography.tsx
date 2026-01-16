import { cn } from "@/lib/cn"
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react"

type TypographyProps<T extends ElementType = ElementType> = {
  as?: ElementType
  children: ReactNode
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, "className" | "children">

// Base component factory
function createTypographyComponent<T extends ElementType>(
  defaultElement: T,
  defaultClasses: string
) {
  return function TypographyComponent({
    as,
    children,
    className,
    ...props
  }: TypographyProps<T>) {
    const Component = (as || defaultElement) as ElementType
    return (
      <Component className={cn(defaultClasses, className)} {...props}>
        {children}
      </Component>
    )
  }
}

// Typography Components - Exact Type Scale (No Deviations)

/**
 * PageTitle (H1)
 * text-4xl font-semibold tracking-tight leading-tight
 */
export const PageTitle = createTypographyComponent(
  "h1",
  "text-4xl font-semibold tracking-tight leading-tight"
)

/**
 * SectionTitle (H2)
 * text-2xl font-semibold tracking-tight leading-snug
 */
export const SectionTitle = createTypographyComponent(
  "h2",
  "text-2xl font-semibold tracking-tight leading-snug"
)

/**
 * CardTitle (H3)
 * text-lg font-semibold leading-snug
 */
export const CardTitle = createTypographyComponent(
  "h3",
  "text-lg font-semibold leading-snug"
)

/**
 * SmallHeading (H4)
 * text-sm font-semibold uppercase tracking-wide
 */
export const SmallHeading = createTypographyComponent(
  "h4",
  "text-sm font-semibold uppercase tracking-wide"
)

/**
 * Text (body)
 * text-base leading-7
 */
export const Text = createTypographyComponent("p", "text-base leading-7")

/**
 * Muted (muted body)
 * text-base text-gray-600 leading-7
 */
export const Muted = createTypographyComponent(
  "p",
  "text-base text-gray-600 leading-7"
)

/**
 * Small (small text)
 * text-sm leading-6
 */
export const Small = createTypographyComponent("p", "text-sm leading-6")

/**
 * Caption (fine print)
 * text-xs text-gray-600 leading-5
 */
export const Caption = createTypographyComponent(
  "p",
  "text-xs text-gray-600 leading-5"
)

/**
 * NavLinkText
 * text-sm font-medium
 */
export const NavLinkText = createTypographyComponent(
  "span",
  "text-sm font-medium"
)

/**
 * ButtonText
 * text-sm font-semibold
 */
export const ButtonText = createTypographyComponent(
  "span",
  "text-sm font-semibold"
)

/**
 * LabelText
 * text-sm font-medium
 */
export const LabelText = createTypographyComponent(
  "label",
  "text-sm font-medium"
)
