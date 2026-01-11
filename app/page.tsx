type Software = {
  id: string
  name: string
  tagline: string
  url: string
  upvotes: number
}

const softwareToday: Software[] = [
  {
    id: "guideless",
    name: "Guideless",
    tagline: "Turn workflows into AI-powered video guides in minutes.",
    url: "https://guideless.ai",
    upvotes: 42,
  },
  {
    id: "loom",
    name: "Loom",
    tagline: "Record quick video messages to share your screen and ideas.",
    url: "https://www.loom.com",
    upvotes: 31,
  },
  {
    id: "notion",
    name: "Notion",
    tagline: "Docs, wikis, and projects in one place.",
    url: "https://www.notion.so",
    upvotes: 27,
  },
]

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10">
          <h1 className="text-4xl font-bold">Hobbyrider</h1>
          <p className="mt-3 text-gray-600">
            Discover and share software worth riding 🏂
          </p>
        </header>

        <section>
          <h2 className="text-xl font-semibold">Today</h2>

          <ul className="mt-4 space-y-3">
            {softwareToday
              .sort((a, b) => b.upvotes - a.upvotes)
              .map((item) => (
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
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border px-3 py-1">
                      <span className="text-sm font-semibold">{item.upvotes}</span>
                      <span className="text-sm text-gray-600">upvotes</span>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </main>
  )
}