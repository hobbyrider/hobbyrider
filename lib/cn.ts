/**
 * Utility function to merge classNames safely
 * Minimal implementation - no heavy dependencies
 */
type ClassValue = string | number | boolean | undefined | null

export function cn(...classes: ClassValue[]): string {
  return classes
    .filter((cls): cls is string => typeof cls === "string" && cls.trim().length > 0)
    .join(" ")
}
