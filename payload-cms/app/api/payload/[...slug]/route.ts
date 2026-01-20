import { payloadRestRoute } from '@payloadcms/next/routes'
import configPromise from '@/payload.config'

export const GET = payloadRestRoute({
  config: configPromise,
})

export const POST = payloadRestRoute({
  config: configPromise,
})

export const DELETE = payloadRestRoute({
  config: configPromise,
})

export const PATCH = payloadRestRoute({
  config: configPromise,
})
