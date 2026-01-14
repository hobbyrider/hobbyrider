import { ensureCategoriesExist } from "@/app/actions/categories"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await ensureCategoriesExist()
    return NextResponse.json({ success: true, message: "Categories seeded" })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to seed categories" },
      { status: 500 }
    )
  }
}
