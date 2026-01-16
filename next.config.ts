import type { NextConfig } from "next";
// PayloadCMS is currently disabled - see docs/archive/payloadcms/ for details
// import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  // Turbopack configuration for Next.js 16
  turbopack: {
    resolveAlias: {
      // Map server-only modules if needed
    },
  },
  // Exclude archived code from build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Image optimization configuration
  images: {
    // Disable image optimization in development for faster local development
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
      },
      // Allow any HTTPS image for flexibility (product URLs, user avatars, etc.)
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig
