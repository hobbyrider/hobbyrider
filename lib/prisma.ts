import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

function getAccelerateUrl() {
  const url = process.env.PRISMA_DATABASE_URL
  if (!url) {
    throw new Error(
      "Missing PRISMA_DATABASE_URL. Add it to .env.local (local) and Vercel Environment Variables (prod)."
    )
  }
  return url
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    accelerateUrl: getAccelerateUrl(),
    log: ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}