export const dynamic = "force-dynamic"

import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { deleteSoftware } from "@/app/actions/software"

type SoftwareItem = {
  id: string
  name: string
  tagline: string
  url: string
  upvotes: number
}

export default async function Home() {
  const softwareToday: SoftwareItem[] = await prisma.software.findMany({
    orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
    take: 50,
    select: {
      id: true,
      name: true,
      tagline: true,
      url: true,
      upvotes: true,
    },
  })

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10">
          <h1 className="text-4xl font-bold">hobbyrider</h1>
          <p className="mt-3 text-gray-600">
            Discover and share software worth riding 🤖
          </p>

          <Link
            href="/submit"
            className="mt-4 inline-block rounded-lg border px-4 py-2 font-semibold hover:bg-black hover:text-white transition"
          >
            Submit software
          </Link>
        </header>

        <section>
          <h2 className="text-xl font-semibold">Today</h2>

          {softwareToday.length === 0 ? (
            <p className="mt-4 text-gray-600">
              No submissions yet. Be the first!
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {softwareToday.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold underline underline-offset-4"
                      >
                        {item.name}
                      </a>
                      <p className="mt-1 text-gray-600">{item.tagline}</p>

                      {/* ADMIN DELETE */}
                      <form
                        action={async (formData) => {
                          "use server"
                          await deleteSoftware(
                            item.id,
                            String(formData.get("password") ?? "")
                          )
                        }}
                        className="mt-3 flex gap-2"
                      >
                        <input
                          type="password"
                          name="password"
                          placeholder="Admin password"
                          className="rounded border px-2 py-1 text-sm"
                          required
                        />
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </form>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border px-3 py-1">
                      <span className="text-sm font-semibold">
                        {item.upvotes}
                      </span>
                      <span className="text-sm text-gray-600">upvotes</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}