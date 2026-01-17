"use client"

import { signUp } from "@/app/actions/auth"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthProviders } from "@/app/components/auth-providers"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await signUp(email, password, username, name || undefined)

      // Auto sign in after signup
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      }) as { error?: string } | undefined

      if (result?.error) {
        setError("Account created but sign in failed. Please try logging in.")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-black mb-4 sm:mb-6 inline-block"
        >
          ← Back to home
        </Link>

        <div className="rounded-xl border p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Sign up</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Create an account to submit products and engage with the community
          </p>

          {/* OAuth & Magic Link Providers */}
          <div className="space-y-3 mb-6">
            <AuthProviders email={email} setEmail={setEmail} loading={loading} />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or create account with password</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                placeholder="johndoe"
                required
                disabled={loading}
                pattern="[a-z0-9_]+"
                title="Only lowercase letters, numbers, and underscores"
              />
              <p className="mt-1 text-xs text-gray-500">
                Only lowercase letters, numbers, and underscores
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                placeholder="John Doe"
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                placeholder="••••••••"
                required
                minLength={6}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                At least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border px-4 py-2 font-semibold hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Sign up with Password"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        </div>
      </div>
    </main>
  )
}
