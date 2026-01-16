import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { EditProfileForm } from "./edit-form"

export const dynamic = "force-dynamic"

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Try to find by username first, then by ID
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: id }, { id }],
    },
  })

  if (!user) {
    notFound()
  }

  // Check if user is editing their own profile
  if (user.id !== session.user.id) {
    redirect(`/user/${id}`)
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Edit Profile</h1>
        <EditProfileForm user={user} />
      </div>
    </main>
  )
}
