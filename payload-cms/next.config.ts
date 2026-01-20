import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  // External packages for server components
  serverExternalPackages: ['payload'],
}

export default withPayload(nextConfig)
