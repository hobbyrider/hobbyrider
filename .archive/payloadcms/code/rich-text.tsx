"use client"

import { RichText as RichTextConverter, defaultJSXConverters } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type RichTextProps = {
  data: SerializedEditorState
  className?: string
}

export function RichText({ data, className = "prose prose-gray max-w-none" }: RichTextProps) {
  if (!data) return null

  return (
    <div className={className}>
      <RichTextConverter
        data={data}
        converters={defaultJSXConverters}
      />
    </div>
  )
}
