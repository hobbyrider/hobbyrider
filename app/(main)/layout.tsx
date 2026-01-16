import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "../globals.css"
import { AuthProvider } from "@/app/components/auth-provider"
import { SiteHeader } from "@/app/components/site-header"
import { SiteFooter } from "@/app/components/site-footer"
import { Toaster } from "react-hot-toast"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // This layout is nested inside the root layout which already has <html> and <body>
  // So we just return the content without HTML/body tags
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow"
          >
            Skip to content
          </a>

          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main id="content" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#171717",
                border: "1px solid #e5e5e5",
                borderRadius: "0.75rem",
                padding: "12px 16px",
                fontSize: "14px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              },
              success: {
                iconTheme: {
                  primary: "#16a34a",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#dc2626",
                  secondary: "#fff",
                },
              },
            }}
          />
        </AuthProvider>
    </div>
  )
}
