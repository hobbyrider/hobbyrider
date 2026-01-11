"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SubmitPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [tagline, setTagline] = useState("")
  const [url, setUrl] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const n = name.trim()
    const t = tagline.trim()
    const u = url.trim()

    if (!n || !t || !u) return

    const params = new URLSearchParams({
      name: n,
      tagline: t,
      url: u,
    })

    router.push("/?" + params.toString())
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">Submit software</h1>
        <p className="mt-2 text-gray-600">
          Share a tool you think is worth riding 🏂
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Guideless"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tagline</label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Turn workflows into AI-powered video guides in minutes."
            />
          </div>

          <div>
            <label className="text-sm font-medium">URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="https://example.com"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg border px-4 py-2 font-semibold hover:bg-black hover:text-white transition"
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  )
}