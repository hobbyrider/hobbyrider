import configPromise from '@/payload.config'
import { NotFoundPage } from '@payloadcms/next/views'
import { importMap } from '../importMap.js'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export default async function NotFound({ params, searchParams }: Args) {
  return <NotFoundPage config={configPromise} importMap={importMap} params={params} searchParams={searchParams} />
}
