import { createSoftware } from "@/app/actions/software"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const productId = await createSoftware(formData, true)
    
    if (!productId) {
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      )
    }

    return NextResponse.json({ productId })
  } catch (error: any) {
    console.error("Create product error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 400 }
    )
  }
}
