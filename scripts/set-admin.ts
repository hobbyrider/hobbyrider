/**
 * Script to set a user as admin
 * Usage: npx tsx scripts/set-admin.ts <email>
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function setAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    })

    console.log(`✅ User ${user.email} (${user.username || user.name || user.id}) is now an admin!`)
  } catch (error: any) {
    if (error.code === "P2025") {
      console.error(`❌ User with email "${email}" not found`)
      console.log("\nAvailable users:")
      const users = await prisma.user.findMany({
        select: { email: true, username: true, name: true },
      })
      users.forEach((u) => {
        console.log(`  - ${u.email} (${u.username || u.name || "no username"})`)
      })
    } else {
      console.error("❌ Error:", error.message)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2]

if (!email) {
  console.error("❌ Please provide an email address")
  console.log("Usage: npx tsx scripts/set-admin.ts <email>")
  process.exit(1)
}

setAdmin(email)
