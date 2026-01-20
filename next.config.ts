import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// PayloadCMS is currently disabled - see docs/archive/payloadcms/ for details
// import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  // Turbopack configuration for Next.js 16
  turbopack: {
    resolveAlias: {
      // Map server-only modules if needed
    },
  },
  // Exclude archived code and payload-cms from build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Exclude payload-cms directory from Next.js build (it's a separate app)
  webpack: (config, { isServer }) => {
    // Exclude payload-cms from webpack processing
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/payload-cms/**'],
    }
    return config
  },
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
}

// Wrap the config with Sentry's config wrapper
export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "hobbyrider",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
