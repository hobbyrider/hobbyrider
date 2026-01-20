import type { Metadata } from 'next'
import configPromise from '@/payload.config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap.js'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> => {
  return generatePageMetadata({ config: configPromise, params, searchParams })
}

export default async function AdminPage({ params, searchParams }: Args) {
  return <RootPage config={configPromise} importMap={importMap} params={params} searchParams={searchParams} />
}
