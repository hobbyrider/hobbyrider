"use server"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createSoftware(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const tagline = String(formData.get("tagline") ?? "").trim()
  const url = String(formData.get("url") ?? "").trim()

  if (!name || !tagline || !url) throw new Error("Missing fields")

  await prisma.software.create({
    data: { name, tagline, url, upvotes: 0 },
  })

  revalidatePath("/")
  redirect("/")
}

export async function deleteSoftware(id: string, adminPassword: string) {
  if (!process.env.ADMIN_PASSWORD) throw new Error("Missing ADMIN_PASSWORD")
  if (adminPassword !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized")

  await prisma.software.delete({ where: { id } })

  revalidatePath("/")
}