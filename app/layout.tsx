import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/app/components/auth-provider"
import { PostHogProvider } from "@/app/components/posthog-provider"

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
  // suppressHydrationWarning prevents React from throwing errors
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body suppressHydrationWarning className="font-sans">
        <PostHogProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
