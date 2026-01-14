"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signUp(
  email: string,
  password: string,
  username: string,
  name?: string
) {
  // Validate inputs
  if (!email || !password || !username) {
    throw new Error("Email, password, and username are required")
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters")
  }

  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  })

  if (existingEmail) {
    throw new Error("Email already registered")
  }

  // Check if username already exists
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  })

  if (existingUsername) {
    throw new Error("Username already taken")
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      username,
      name: name || username,
    },
  })

  revalidatePath("/")
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  })
}

export async function getUserByUsername(username: string) {
  return await prisma.user.findUnique({
    where: { username },
  })
}
