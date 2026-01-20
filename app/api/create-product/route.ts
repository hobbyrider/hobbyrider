import { createSoftware } from "@/app/actions/software"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPostHogClient } from "@/lib/posthog-server"

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

    // Fetch product to get slug for canonical URL
    const product = await prisma.software.findUnique({
      where: { id: productId },
      select: { slug: true, name: true, makerId: true },
    })

    // Track product created event server-side
    const posthog = getPostHogClient()
    if (posthog) {
      const distinctId = request.headers.get("x-posthog-distinct-id") || product?.makerId || "anonymous"
      posthog.capture({
        distinctId,
        event: "product_created",
        properties: {
          product_id: productId,
          product_name: product?.name,
          product_slug: product?.slug,
          source: "api",
        },
      })
    }

    return NextResponse.json({
      productId,
      slug: product?.slug || null,
    })
  } catch (error: any) {
    console.error("Create product error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 400 }
    )
  }
}
