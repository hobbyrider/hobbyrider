import { handlers } from "@/lib/auth"
import type { NextRequest } from "next/server"

export const { GET, POST } = handlers

// Add runtime configuration for better error handling
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
