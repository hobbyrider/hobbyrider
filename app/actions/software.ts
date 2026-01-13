"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deleteSoftware(
  id: string,
  adminPassword: string
) {
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    throw new Error("Unauthorized")
  }

  await prisma.software.delete({
    where: { id },
  })

  revalidatePath("/")
}