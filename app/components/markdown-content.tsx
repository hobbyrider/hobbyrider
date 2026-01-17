"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type MarkdownContentProps = {
  content: string
  className?: string
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  return (
    <div className={`prose prose-gray max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize heading styles
          h1: ({ node, ...props }) => <h1 className="text-2xl font-semibold text-gray-900 mt-6 mb-3" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-semibold text-gray-900 mt-5 mb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2" {...props} />,
          // Customize paragraph
          p: ({ node, ...props }) => <p className="text-gray-700 mb-3 leading-relaxed" {...props} />,
          // Customize lists
          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700" {...props} />,
          li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
          // Customize strong/bold
          strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
          // Customize emphasis/italic
          em: ({ node, ...props }) => <em className="italic text-gray-700" {...props} />,
          // Block quotes
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-3" {...props} />
          ),
          // Links (disabled for security, but keeping structure)
          a: ({ node, ...props }) => <span className="text-gray-700" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
