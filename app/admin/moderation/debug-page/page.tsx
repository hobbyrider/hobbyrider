import { getSession } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function DebugAdminPage() {
  const session = await getSession()
  
  if (!session?.user?.id) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
            <h1 className="text-2xl font-semibold text-red-900">Not Logged In</h1>
            <p className="mt-2 text-base text-red-700">
              Please log in first.
            </p>
          </div>
        </div>
      </main>
    )
  }

  // Get full user info
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      isAdmin: true,
    },
  })

  // Check reports
  const reportCount = await prisma.report.count()

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
          <h1 className="mb-4 text-2xl font-semibold text-blue-900">Admin Debug Info</h1>
          
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-4">
              <h2 className="mb-2 font-semibold text-gray-900">Session Info</h2>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>User ID: {session.user.id}</li>
                <li>Email: {session.user.email || "N/A"}</li>
                <li>Name: {session.user.name || "N/A"}</li>
              </ul>
            </div>

            <div className="rounded-lg bg-white p-4">
              <h2 className="mb-2 font-semibold text-gray-900">Database User Info</h2>
              {user ? (
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>ID: {user.id}</li>
                  <li>Email: {user.email}</li>
                  <li>Username: {user.username || "N/A"}</li>
                  <li>Name: {user.name || "N/A"}</li>
                  <li className={`font-semibold ${user.isAdmin ? "text-green-600" : "text-red-600"}`}>
                    isAdmin: {user.isAdmin ? "✅ TRUE" : "❌ FALSE"}
                  </li>
                </ul>
              ) : (
                <p className="text-sm text-red-600">User not found in database!</p>
              )}
            </div>

            <div className="rounded-lg bg-white p-4">
              <h2 className="mb-2 font-semibold text-gray-900">Reports</h2>
              <p className="text-sm text-gray-700">Total reports in database: {reportCount}</p>
            </div>

            {user && !user.isAdmin && (
              <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                <h3 className="mb-2 font-semibold text-yellow-900">⚠️ You are NOT an admin</h3>
                <p className="mb-3 text-sm text-yellow-800">
                  To become an admin:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
                  <li>Run: <code className="bg-yellow-100 px-1 rounded">npx prisma studio</code></li>
                  <li>Find user with email: <code className="bg-yellow-100 px-1 rounded">{user.email}</code></li>
                  <li>Set <code className="bg-yellow-100 px-1 rounded">isAdmin</code> to <code className="bg-yellow-100 px-1 rounded">true</code></li>
                  <li>Save the changes</li>
                  <li>Log out and log back in</li>
                  <li>Visit <code className="bg-yellow-100 px-1 rounded">/admin/moderation</code></li>
                </ol>
              </div>
            )}

            {user && user.isAdmin && (
              <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                <h3 className="mb-2 font-semibold text-green-900">✅ You ARE an admin!</h3>
                <p className="mb-3 text-sm text-green-800">
                  You should be able to access the moderation page.
                </p>
                <a
                  href="/admin/moderation"
                  className="inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Go to Moderation Dashboard →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
