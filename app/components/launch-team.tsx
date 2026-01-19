"use client"

import Link from "next/link"
import Image from "next/image"

type LaunchTeamMember = {
  id: string
  name: string
  role?: string | null
  isExternal: boolean
  user?: {
    id: string
    username: string | null
    name: string | null
    image: string | null
  } | null
}

type LaunchTeamProps = {
  members: LaunchTeamMember[]
  isOwner?: boolean
  productId?: string
  onEdit?: () => void
}

export function LaunchTeam({ members, isOwner = false, productId, onEdit }: LaunchTeamProps) {
  if (members.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Built with</h3>
        {isOwner && onEdit && (
          <button
            onClick={onEdit}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Edit
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        {members.map((member) => {
          const displayName = member.user?.name || member.user?.username || member.name
          const avatar = member.user?.image
          const profileUrl = member.user?.username 
            ? `/user/${member.user.username}` 
            : member.user?.id 
            ? `/user/${member.user.id}` 
            : null

          return (
            <div
              key={member.id}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
            >
              {avatar && (
                <div className="h-8 w-8 flex-shrink-0 rounded-full overflow-hidden relative">
                  <Image
                    src={avatar}
                    alt={displayName}
                    fill
                    className="object-cover"
                    sizes="32px"
                    unoptimized={process.env.NODE_ENV === 'development'}
                  />
                </div>
              )}
              <div className="min-w-0">
                {profileUrl ? (
                  <Link
                    href={profileUrl}
                    className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors block truncate"
                  >
                    {displayName}
                  </Link>
                ) : (
                  <span className="text-sm font-medium text-gray-900 block truncate">
                    {displayName}
                  </span>
                )}
                {member.role && (
                  <span className="text-xs text-gray-500 block truncate">
                    {member.role}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
