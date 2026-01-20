import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  // Your custom Next.js config here
  // External packages for server components
  serverExternalPackages: ['payload'],
}

export default withPayload(nextConfig)
