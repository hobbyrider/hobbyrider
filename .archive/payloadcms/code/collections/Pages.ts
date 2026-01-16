import type { CollectionConfig } from 'payload'

const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'template', 'published', 'updatedAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      // Public read access for published pages
      // Admins can see all pages
      if (user?.role === 'admin') return true
      return {
        published: {
          equals: true,
        },
      }
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user && user.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL path (e.g., "about" for /page/about)',
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // Auto-generate slug from title if not provided
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'template',
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Landing', value: 'landing' },
        { label: 'About', value: 'about' },
      ],
      defaultValue: 'default',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'seoTitle',
      type: 'text',
      admin: {
        description: 'SEO title (defaults to title if empty)',
        position: 'sidebar',
      },
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      admin: {
        description: 'SEO description',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}

export default Pages
