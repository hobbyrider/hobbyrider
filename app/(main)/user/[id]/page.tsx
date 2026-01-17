import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getSession } from "@/lib/get-session"
import { ProductList } from "./product-list"
import { ProfileTabs } from "./profile-tabs"
import { ReportButton } from "@/app/components/report-button"
import { FollowButton } from "@/app/components/follow-button"
import { getFollowCounts, getFollowStatus } from "@/app/actions/follow"
import { getRelativeTime } from "@/lib/utils"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "https://hobbyrider.vercel.app"
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: id }, { id }],
    },
    select: {
      id: true,
      name: true,
      username: true,
      headline: true,
      bio: true,
      image: true,
    },
  })

  if (!user) {
    return {
      title: "User Not Found",
    }
  }

  const baseUrl = getBaseUrl()
  const userUrl = `${baseUrl}/user/${user.username || user.id}`
  const displayName = user.name || user.username || "User"
  const description = user.bio || user.headline || `View ${displayName}'s profile on hobbyrider`

  return {
    title: `${displayName} · hobbyrider`,
    description: description,
    openGraph: {
      title: `${displayName} · hobbyrider`,
      description: description,
      url: userUrl,
      type: "profile",
      images: user.image ? [user.image] : undefined,
    },
    twitter: {
      card: "summary",
      title: `${displayName} · hobbyrider`,
      description: description,
      images: user.image ? [user.image] : undefined,
    },
  }
}

export default async function UserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const searchParamsResolved = await searchParams
  const tab = searchParamsResolved.tab || "about"
  const session = await getSession()

  // Try to find by username first, then by ID
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: id }, { id }],
    },
    include: {
      madeProducts: {
        orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
        include: {
          _count: {
            select: {
              comments: true,
            },
          },
        },
      },
      upvotes: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              tagline: true,
              thumbnail: true,
              upvotes: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              tagline: true,
              thumbnail: true,
            },
          },
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  const totalUpvotes = user.madeProducts.reduce(
    (sum, p) => sum + p.upvotes,
    0
  )
  const totalProducts = user.madeProducts.length
  const totalUpvotedProducts = user.upvotes.length
  const totalComments = user.comments.length

  // Check if viewing own profile
  const isOwnProfile = session?.user?.id === user.id

  // Get follow counts and status
  const followCounts = await getFollowCounts(user.id)
  const isFollowing = session?.user?.id
    ? await getFollowStatus(session.user.id, user.id)
    : false

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Profile Header */}
          <header className="mb-8">
            <div className="mb-6 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.image ? (
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden border-2 border-gray-200 relative">
                    <Image
                      src={user.image}
                      alt={user.name || user.username || "User"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 96px, 128px"
                      priority
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-gray-200 text-2xl sm:text-4xl font-bold text-gray-700 border-2 border-gray-300">
                    {(user.name || user.username || user.email || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 mb-2 break-words">
                      {user.name || user.username || user.email}
                    </h1>
                    {user.headline && (
                      <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-3 break-words">
                        {user.headline}
                      </p>
                    )}
                    {user.username && (
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 flex-wrap">
                        <span>@{user.username}</span>
                        <span>•</span>
                        <span>{followCounts.followers} {followCounts.followers === 1 ? "follower" : "followers"}</span>
                        <span>•</span>
                        <span>{followCounts.following} following</span>
                      </div>
                    )}
                  </div>

                  {/* Edit Button / Follow Button / Report Button */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                    {isOwnProfile ? (
                      <Link
                        href={`/user/${user.id}/edit`}
                        className="inline-flex items-center justify-center rounded-full border-2 border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 hover:border-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 w-full sm:w-auto"
                      >
                        Edit my profile
                      </Link>
                    ) : (
                      <>
                        <FollowButton 
                          userId={user.id} 
                          isFollowing={isFollowing}
                          isOwnProfile={false}
                        />
                        <ReportButton 
                          type="user" 
                          contentId={user.id} 
                          contentName={user.username || user.name || user.email} 
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Link - Only show if user is admin */}
            {user.isAdmin && (
              <div className="mb-4 pt-2 border-t border-gray-200">
                <Link
                  href="/admin/moderation"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Admin-only
                </Link>
              </div>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 border-t border-gray-200 pt-4">
              <div>
                <span className="font-semibold text-gray-900">{totalProducts}</span>{" "}
                {totalProducts === 1 ? "product" : "products"}
              </div>
              <div>
                <span className="font-semibold text-gray-900">{totalUpvotes}</span>{" "}
                total upvotes
              </div>
              <div>
                <span className="font-semibold text-gray-900">{totalUpvotedProducts}</span>{" "}
                upvoted
              </div>
              <div>
                <span className="font-semibold text-gray-900">{totalComments}</span>{" "}
                {totalComments === 1 ? "comment" : "comments"}
              </div>
              <div>
                Member since {new Date(user.createdAt).getFullYear()}
              </div>
            </div>
          </header>

        {/* Tab Navigation */}
        <ProfileTabs
          activeTab={tab as "about" | "products" | "activity" | "upvotes"}
          userId={user.id}
          username={user.username || user.id}
          isOwnProfile={isOwnProfile}
          user={user}
          products={user.madeProducts}
          upvotedProducts={user.upvotes.map((u) => u.product)}
          comments={user.comments}
        />
        </div>
      </div>
    </main>
  )
}
