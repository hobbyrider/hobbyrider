import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "hobbyrider",
    template: "%s · hobbyrider",
  },
  description: "Discover and share software worth riding.",
  icons: {
    icon: "/icon.svg",
  },
}

// Root layout - Next.js requires this at app/layout.tsx with <html> and <body>
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Next.js requires <html> and <body> at root layout
  // PayloadCMS's RootLayout also renders these, causing nesting
  // suppressHydrationWarning prevents React from throwing errors
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
