"use client"

import { signIn, getProviders } from "next-auth/react"
import { useState, useEffect } from "react"

type AuthProvidersProps = {
  email: string
  setEmail: (email: string) => void
  loading?: boolean
}

export function AuthProviders({ email, setEmail, loading = false }: AuthProvidersProps) {
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [providers, setProviders] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    getProviders().then(setProviders).catch(console.error)
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      setError("")
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: true,
      })
      // If redirect is false, check for errors
      if (result?.error) {
        setError("Failed to sign in with Google. Please try again.")
      }
    } catch (error: any) {
      console.error("Google sign in error:", error)
      setError(error.message || "Failed to sign in with Google")
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }
    try {
      setError("")
      await signIn("email", { email, callbackUrl: "/" })
      setMagicLinkSent(true)
    } catch (error: any) {
      console.error("Magic link error:", error)
      setError(error.message || "Failed to send magic link")
    }
  }

  const hasGoogle = providers?.google !== undefined
  const hasEmail = providers?.email !== undefined

  return (
    <>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Google OAuth */}
      {hasGoogle && (
        <>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
        </>
      )}

      {/* Magic Link / Email */}
      {hasEmail && (
        <div>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setMagicLinkSent(false)
          }}
          className="w-full rounded-lg border px-3 py-2 mb-2"
          placeholder="you@example.com"
          disabled={loading || magicLinkSent}
        />
        <button
          onClick={handleMagicLink}
          disabled={loading || !email || magicLinkSent}
          className="w-full rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {magicLinkSent ? "Check your email!" : "Send Magic Link"}
        </button>
        {magicLinkSent ? (
          <p className="mt-2 text-xs text-green-600 text-center">
            We sent a sign-in link to {email}. Check your inbox!
          </p>
        ) : (
          <p className="mt-2 text-xs text-gray-500 text-center">
            We'll send you a sign-in link via email
          </p>
        )}
        </div>
      )}

      {!hasGoogle && !hasEmail && (
        <div className="text-sm text-gray-500 text-center py-4">
          OAuth providers not configured. Please set up Google OAuth or Email provider in environment variables.
        </div>
      )}
    </>
  )
}
