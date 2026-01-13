import { createSoftware } from "../actions/software"

export default function SubmitPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">submit software</h1>
        <p className="mt-2 text-gray-600">
          Share a tool you think is worth riding 🤖
        </p>

        <form action={createSoftware} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              name="name"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="ClickUp"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tagline</label>
            <input
              name="tagline"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Manage tasks, docs, and projects in one place."
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">URL</label>
            <input
              name="url"
              type="url"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="https://clickup.com"
              required
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