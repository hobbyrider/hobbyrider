"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ProductList } from "./product-list"
import { getRelativeTime } from "@/lib/utils"

type Tab = "about" | "products" | "activity" | "upvotes"

type User = {
  id: string
  name: string | null
  username: string | null
  email: string
  image: string | null
  headline: string | null
  bio: string | null
  website: string | null
  linkedin: string | null
  twitter: string | null
  createdAt: Date
}

type Product = {
  id: string
  name: string
  tagline: string
  thumbnail: string | null
  upvotes: number
  createdAt: Date
  _count: {
    comments: number
  }
}

type Comment = {
  id: string
  content: string
  createdAt: Date
  product: {
    id: string
    name: string
    tagline: string
    thumbnail: string | null
  }
}

type ProfileTabsProps = {
  activeTab: string
  userId: string
  username: string
  isOwnProfile: boolean
  user: User
  products: Product[]
  upvotedProducts: Product[]
  comments: Comment[]
}

export function ProfileTabs({
  activeTab,
  userId,
  username,
  isOwnProfile,
  user,
  products,
  upvotedProducts,
  comments,
}: ProfileTabsProps) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "about", label: "About" },
    { id: "products", label: "Products" },
    { id: "activity", label: "Activity" },
    { id: "upvotes", label: "Upvotes" },
  ]

  return (
    <div>
      {/* Tab Navigation */}
      <nav className="border-b border-gray-200 mb-8">
        <div className="flex gap-8 -mb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <Link
                key={tab.id}
                href={`/user/${username}?tab=${tab.id}`}
                className={`pb-4 px-1 text-sm font-medium transition-colors border-b-2 ${
                  isActive
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Tab Content */}
      <div>
        {activeTab === "about" && (
          <AboutTab user={user} isOwnProfile={isOwnProfile} />
        )}
        {activeTab === "products" && (
          <ProductsTab products={products} isOwnProfile={isOwnProfile} />
        )}
        {activeTab === "activity" && (
          <ActivityTab comments={comments} />
        )}
        {activeTab === "upvotes" && (
          <UpvotesTab products={upvotedProducts} />
        )}
      </div>
    </div>
  )
}

function AboutTab({ user, isOwnProfile }: { user: User; isOwnProfile: boolean }) {
  const hasBio = user.bio && user.bio.trim().length > 0
  const hasLinks = user.website || user.linkedin || user.twitter

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">About</h2>
        {hasBio ? (
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {user.bio}
          </p>
        ) : (
          <p className="text-gray-500 italic">No bio yet.</p>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Links</h3>
        {hasLinks ? (
          <div className="flex flex-wrap gap-4">
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                    clipRule="evenodd"
                  />
                </svg>
                {new URL(user.website).hostname.replace("www.", "")}
              </a>
            )}
            {user.linkedin && (
              <a
                href={user.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            )}
            {user.twitter && (
              <a
                href={user.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No links added yet.</p>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Badges</h3>
        <div className="flex flex-wrap gap-3">
          {/* Placeholder for badges */}
          <p className="text-sm text-gray-500">No badges yet.</p>
        </div>
      </section>
    </div>
  )
}

function ProductsTab({ products, isOwnProfile }: { products: Product[]; isOwnProfile: boolean }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Products</h2>
      <ProductList products={products} isOwnProfile={isOwnProfile} />
    </div>
  )
}

function ActivityTab({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Activity</h2>
        <p className="text-gray-600">No activity yet.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Activity</h2>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="border-b border-gray-200 pb-4 last:border-b-0"
          >
            <div className="flex items-start gap-4">
              {comment.product.thumbnail && (
                <img
                  src={comment.product.thumbnail}
                  alt={comment.product.name}
                  className="h-12 w-12 rounded-lg object-cover border flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/product/${comment.product.id}`}
                    className="font-semibold text-gray-900 hover:underline"
                  >
                    {comment.product.name}
                  </Link>
                  <span className="text-xs text-gray-500">
                    {getRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{comment.product.tagline}</p>
                <p className="text-gray-700 text-sm">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UpvotesTab({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upvotes</h2>
        <p className="text-gray-600">No upvoted products yet.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upvotes</h2>
      <div className="space-y-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="flex items-start gap-4 rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
          >
            {product.thumbnail && (
              <img
                src={product.thumbnail}
                alt={product.name}
                className="h-16 w-16 rounded-lg object-cover border flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.tagline}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{product.upvotes} upvotes</span>
                <span>•</span>
                <span>{getRelativeTime(product.createdAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
