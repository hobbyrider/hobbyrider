import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  // Your custom Next.js config here
  // Enable experimental features for better TypeScript/ESM support
  experimental: {
    serverComponentsExternalPackages: ['payload'],
  },
}

export default withPayload(nextConfig)
