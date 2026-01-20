import type { CollectionConfig } from 'payload'

const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // Public read access
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user && user.role === 'admin',
  },
  upload: {
    staticDir: 'media',
    // Use Vercel Blob or local storage
    // For now, using local storage (can be configured later)
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Alt text for accessibility',
      },
    },
  ],
}

export default Media
