import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

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
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body suppressHydrationWarning className="font-sans">
        {children}
      </body>
    </html>
  )
}
