import type { CollectionConfig } from 'payload'

const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200, // 2 hours
    useAPIKey: false,
    useSessions: false, // Disable sessions to avoid users_sessions table issues
    depth: 0,
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // 10 minutes
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
  },
  access: {
    read: ({ req: { user } }) => {
      // Users can read their own data, admins can read all
      if (user) {
        if (user.role === 'admin') {
          return true
        }
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },
    create: () => true, // Allow registration
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') {
        return true
      }
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Author', value: 'author' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}

export default Users
