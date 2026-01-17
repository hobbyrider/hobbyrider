import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"
import { NextResponse } from "next/server"

/**
 * One-time API endpoint to update the maker field for all products
 * belonging to the current user to match their current username.
 * 
 * This fixes the issue where products still show the old username
 * in the maker field after a username change.
 */
export async function POST() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current user to fetch their username
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const newMaker = user.username || user.name || "Unknown"

    // Update all products where makerId matches the current user
    const result = await prisma.software.updateMany({
      where: {
        makerId: session.user.id,
      },
      data: {
        maker: newMaker,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Updated ${result.count} product(s) with maker field: "${newMaker}"`,
      updatedCount: result.count,
    })
  } catch (error: any) {
    console.error("Update maker field error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update maker field" },
      { status: 500 }
    )
  }
}
