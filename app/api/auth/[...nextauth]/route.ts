import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers

// Add runtime configuration for better error handling
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
