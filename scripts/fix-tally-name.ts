/**
 * Quick fix script to correct Tally's name
 */

import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

async function fixTally() {
  try {
    const tally = await prisma.software.findFirst({
      where: { url: 'https://tally.so' }
    })

    if (!tally) {
      console.log("❌ Tally product not found")
      return
    }

    console.log(`\n📦 Found: ${tally.name} (${tally.url})`)
    console.log(`   Current name: "${tally.name}"`)
    
    if (tally.name === "Tally") {
      console.log("✅ Name is already correct")
      return
    }

    await prisma.software.update({
      where: { id: tally.id },
      data: { name: "Tally" },
    })

    console.log(`   ✅ Updated name to: "Tally"`)
    console.log(`\n✨ Done!`)
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`)
    throw error
  }
}

fixTally()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
