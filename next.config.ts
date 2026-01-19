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
    // Production: Images are automatically optimized by Next.js Image component
    unoptimized: process.env.NODE_ENV === 'development',
    // Supported image formats (WebP is prioritized for better compression)
    formats: ['image/webp', 'image/avif'],
    // Device sizes for responsive images (Next.js generates srcset automatically)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Remote image patterns (Vercel Blob and external sources)
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
    // Content Security Policy for images (if needed)
    minimumCacheTTL: 60, // Cache optimized images for 60 seconds minimum
  },
};

export default nextConfig
