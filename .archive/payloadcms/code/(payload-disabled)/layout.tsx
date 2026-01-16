import React, { ReactNode } from 'react'
import type { ServerFunctionClient } from 'payload'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import configPromise from '@/payload.config'
import { importMap } from './admin/importMap.js'

const serverFunction: ServerFunctionClient = async (args) => {
  'use server'
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  })
}

// PayloadCMS RootLayout renders its own <html> and <body>
// This is nested inside the root layout's <body>, causing invalid HTML
// Unfortunately, Next.js requires root layout to have <html>/<body>
// and PayloadCMS requires RootLayout to render its own <html>/<body>
// This is a known limitation - the root layout uses suppressHydrationWarning
// to suppress the error, but the HTML structure is still technically invalid
export default async function PayloadLayout({ children }: { children: ReactNode }) {
  return (
    <RootLayout config={configPromise} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
