import { RESTHandler, handleREST } from '@payloadcms/next/routes'
import configPromise from '@/payload.config'

const handler = async (req: Request) => {
  const restHandler = new RESTHandler({
    config: configPromise,
  })

  return handleREST(req, restHandler)
}

export const GET = handler
export const POST = handler
export const DELETE = handler
export const PATCH = handler
