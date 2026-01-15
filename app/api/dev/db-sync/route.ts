import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * Dev-only endpoint to apply small schema tweaks when Prisma CLI can't connect.
 * Adds columns to the Software table if missing.
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  // Intentionally unauthenticated (dev-only). Do not enable this route in production.

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Software" ADD COLUMN IF NOT EXISTS "description" TEXT'
    )
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Software" ADD COLUMN IF NOT EXISTS "embedHtml" TEXT'
    )

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("db-sync error:", e)
    return NextResponse.json(
      { error: e?.message || "Failed to sync DB" },
      { status: 500 }
    )
  }
}

