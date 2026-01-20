import type { CollectionConfig } from 'payload'

const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedAt', 'updatedAt'],
  },
  access: {
    read: () => true, // Public read access
    create: ({ req: { user } }) => !!user, // Only authenticated users
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user && user.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The title of the blog post',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version of title (auto-generated if left empty)',
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
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary for blog listing and SEO',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Main content of the blog post',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Featured image for the blog post',
        position: 'sidebar',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description: 'Publication date',
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Tags for categorizing blog posts',
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
        description: 'SEO description (defaults to excerpt if empty)',
        position: 'sidebar',
      },
    },
    {
      name: 'seoImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'SEO image for social sharing',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
  versions: {
    drafts: true,
  },
}

export default BlogPosts
