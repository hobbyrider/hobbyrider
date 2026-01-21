import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Email from "next-auth/providers/email"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Helper function to generate username from email
function generateUsernameFromEmail(email: string): string {
  // Extract username from email: take part before @ or before first . (whichever comes first)
  // e.g., "felata9289@elafans.com" -> "felata9289"
  // e.g., "user.name@example.com" -> "user"
  let emailPart = email.split("@")[0]
  // Take part before first dot if it exists
  if (emailPart.includes(".")) {
    emailPart = emailPart.split(".")[0]
  }
  return emailPart.toLowerCase().replace(/[^a-z0-9_]/g, "") || "user"
}

// Helper function to ensure unique username (for OAuth/magic link - uses random number)
async function ensureUniqueUsername(baseUsername: string): Promise<string> {
  let username = baseUsername
  let attempts = 0
  const maxAttempts = 100 // Safety limit to prevent infinite loops

  // If username exists, append a random 4-digit number
  while (await prisma.user.findUnique({ where: { username } })) {
    attempts++
    if (attempts > maxAttempts) {
      // Fallback to timestamp-based suffix if too many collisions
      username = `${baseUsername}${Date.now().toString().slice(-6)}`
      break
    }
    const randomNum = Math.floor(1000 + Math.random() * 9000) // 4-digit number (1000-9999)
    username = `${baseUsername}${randomNum}`
  }

  return username
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true, // Required for NextAuth v5 - respects incoming request host
  // Use custom domain (hobbyrider.io) if available, fallback to vercel.app
  basePath: "/api/auth",
  providers: [
    // Google OAuth (only if configured)
    ...((process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID) &&
    (process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET)
      ?         [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET!,
            allowDangerousEmailAccountLinking: true, // Allow linking accounts with same email
          }),
        ]
      : []),
    // Only add Email provider if email is configured
    ...(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER)
      ? [
          Email({
            server: process.env.RESEND_API_KEY
              ? {
                  // Dummy server config when using Resend (required by NextAuth)
                  host: "smtp.resend.com",
                  port: 587,
                  auth: {
                    user: "resend",
                    pass: "dummy",
                  },
                }
              : {
                  host: process.env.SMTP_HOST!,
                  port: parseInt(process.env.SMTP_PORT || "587", 10),
                  auth: {
                    user: process.env.SMTP_USER!,
                    pass: process.env.SMTP_PASSWORD!,
                  },
                },
            from: process.env.SMTP_FROM || process.env.EMAIL_FROM || "noreply@hobbyrider.io",
            sendVerificationRequest: async ({ identifier, url, provider }) => {
              // Use Resend if API key is available (recommended)
              if (process.env.RESEND_API_KEY) {
                const { getEmailHtml, getEmailText } = await import("./email-template")
                
                // Replace hobbyrider.vercel.app with hobbyrider.io in the magic link URL
                const transformedUrl = url.replace(/https?:\/\/hobbyrider\.vercel\.app/g, "https://hobbyrider.io")
                
                const result = await fetch("https://api.resend.com/emails", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    from: provider.from,
                    to: identifier,
                    subject: "Sign in to Hobbyrider",
                    html: getEmailHtml({ url: transformedUrl, host: new URL(transformedUrl).host }),
                    text: getEmailText({ url: transformedUrl, host: new URL(transformedUrl).host }),
                  }),
                })

                if (!result.ok) {
                  const error = await result.json().catch(() => ({}))
                  throw new Error(`Failed to send email: ${error.message || "Unknown error"}`)
                }
              }
              // If using SMTP, NextAuth will handle it automatically with the server config above
            },
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          String(credentials.password),
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.image,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  // Add CSRF protection configuration
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  events: {
    async createUser({ user }) {
      // Generate username for newly created OAuth/magic link users
      if (user.email && !user.username) {
        const baseUsername = generateUsernameFromEmail(user.email)
        const uniqueUsername = await ensureUniqueUsername(baseUsername)

        await prisma.user.update({
          where: { id: user.id },
          data: { username: uniqueUsername },
        })
      }
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers and magic link, ensure existing users have a username
      // (New users are handled by the createUser event)
      if (account?.provider !== "credentials" && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        // If user exists but doesn't have username, generate one from email
        if (dbUser && !dbUser.username) {
          const baseUsername = generateUsernameFromEmail(user.email)
          const uniqueUsername = await ensureUniqueUsername(baseUsername)

          await prisma.user.update({
            where: { id: dbUser.id },
            data: { username: uniqueUsername },
          })
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        // Fetch username and image from database for OAuth users
        if (account?.provider !== "credentials") {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { username: true, image: true },
          })
          token.username = dbUser?.username || null
          token.image = dbUser?.image || user.image || null
        } else {
          token.username = (user as any).username
          token.image = (user as any).image || null
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string | null
        session.user.image = token.image as string | null
      }
      return session
    },
  },
})
