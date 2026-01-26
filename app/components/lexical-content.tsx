"use client"

import React from "react"
import type { ReactElement } from "react"
import { Muted } from "@/app/components/typography"

type LexicalNode = {
  type?: string
  children?: LexicalNode[]
  text?: string
  format?: number // Bit flags: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code
  style?: string
  tag?: string // For headings: "h1", "h2", etc.
  listType?: "bullet" | "number" | "check"
  start?: number // For ordered lists
  value?: number // For list items
  url?: string
  fields?: { url?: string }
  href?: string
  direction?: "ltr" | "rtl"
  indent?: number
  version?: number
  [key: string]: any
}

type LexicalContent = {
  root: {
    children: LexicalNode[]
    direction: string
    format: string
    indent: number
    type: string
    version: number
  }
}

type LexicalContentProps = {
  content: LexicalContent | any
  className?: string
}

/**
 * Lexical format bit flags
 * Format is a bitmask: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code
 */
const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_STRIKETHROUGH = 4
const FORMAT_UNDERLINE = 8
const FORMAT_CODE = 16

/**
 * Check if format flag is set
 */
function hasFormat(format: number | undefined, flag: number): boolean {
  if (!format) return false
  return (format & flag) === flag
}

/**
 * Get URL from a link node (handles various Lexical link formats)
 */
function getLinkUrl(node: LexicalNode): string | null {
  if (!node) return null
  return node.url || node.fields?.url || node.href || null
}

/**
 * Check if a node is a link
 */
function isLinkNode(node: LexicalNode): boolean {
  if (!node) return false
  return (
    node.type === "link" ||
    node.__type === "link" ||
    node.nodeType === "link" ||
    !!getLinkUrl(node)
  )
}

/**
 * Render text with formatting (bold, italic, strikethrough, underline, code)
 */
function renderFormattedText(
  node: LexicalNode,
  key: number | string
): React.ReactNode {
  const text = node.text || ""
  if (!text) return null

  const format = node.format || 0
  const isBold = hasFormat(format, FORMAT_BOLD)
  const isItalic = hasFormat(format, FORMAT_ITALIC)
  const isStrikethrough = hasFormat(format, FORMAT_STRIKETHROUGH)
  const isUnderline = hasFormat(format, FORMAT_UNDERLINE)
  const isCode = hasFormat(format, FORMAT_CODE)

  // Handle links in text nodes
  const url = getLinkUrl(node)
  if (url) {
    let content: React.ReactNode = text
    if (isBold) content = <strong>{content}</strong>
    if (isItalic) content = <em>{content}</em>
    if (isStrikethrough) content = <s>{content}</s>
    if (isUnderline) content = <u>{content}</u>
    if (isCode) content = <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{content}</code>

    return (
      <a
        key={key}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-900 underline underline-offset-2 hover:text-gray-700 transition-colors"
      >
        {content}
      </a>
    )
  }

  // Apply formatting
  let content: React.ReactNode = text

  // Code formatting should wrap other formats
  if (isCode) {
    return (
      <code
        key={key}
        className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-900"
      >
        {text}
      </code>
    )
  }

  // Apply other formatting
  if (isBold) content = <strong className="font-semibold text-gray-900">{content}</strong>
  if (isItalic) content = <em className="italic">{content}</em>
  if (isStrikethrough) content = <s className="line-through">{content}</s>
  if (isUnderline) content = <u className="underline">{content}</u>

  return <span key={key}>{content}</span>
}

/**
 * Recursively render children nodes with proper formatting
 */
function renderChildren(
  children: LexicalNode[],
  parentKey: string = ""
): React.ReactNode[] {
  if (!children || children.length === 0) return []

  return children
    .map((child, idx) => {
      const key = `${parentKey}-${idx}`

      // Handle link nodes
      if (isLinkNode(child)) {
        const url = getLinkUrl(child)
        if (url) {
          const linkChildren = child.children
            ? renderChildren(child.children, key)
            : child.text
            ? [renderFormattedText(child, key)]
            : []
          
          if (linkChildren.length === 0) return null

          return (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 underline underline-offset-2 hover:text-gray-700 transition-colors"
            >
              {linkChildren}
            </a>
          )
        }
      }

      // Handle text nodes
      if (child.type === "text" || (child.text !== undefined && !child.children)) {
        return renderFormattedText(child, key)
      }

      // Handle nodes with children
      if (child.children && child.children.length > 0) {
        const renderedChildren = renderChildren(child.children, key)
        if (renderedChildren.length === 0) return null

        // For inline elements, return as span
        if (
          child.type === "text" ||
          (!child.type && child.text === undefined)
        ) {
          return <span key={key}>{renderedChildren}</span>
        }

        // Let parent handle block-level elements
        return null
      }

      return null
    })
    .filter(Boolean) as React.ReactNode[]
}

/**
 * Render a single Lexical node
 */
function renderLexicalNode(
  node: LexicalNode,
  key: number
): React.ReactNode {
  if (!node) return null

  const nodeType = node.type || ""
  const children = node.children || []
  const renderedChildren = renderChildren(children, `node-${key}`)

  switch (nodeType) {
    case "heading": {
      // Determine heading level (h1-h6)
      const tag = node.tag || "h2"
      const level = tag.replace("h", "") || "2"
      const headingLevel = Math.min(Math.max(parseInt(level) || 2, 1), 6)
      const HeadingTag = `h${headingLevel}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

      const headingClasses = {
        h1: "text-3xl sm:text-4xl font-bold text-gray-900 mt-8 sm:mt-10 mb-4 sm:mb-6 leading-tight",
        h2: "text-2xl sm:text-3xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4 leading-tight",
        h3: "text-xl sm:text-2xl font-semibold text-gray-900 mt-5 sm:mt-6 mb-2 sm:mb-3 leading-snug",
        h4: "text-lg sm:text-xl font-semibold text-gray-900 mt-4 sm:mt-5 mb-2 leading-snug",
        h5: "text-base sm:text-lg font-semibold text-gray-900 mt-4 mb-2 leading-snug",
        h6: "text-sm sm:text-base font-semibold text-gray-900 mt-3 mb-2 leading-snug",
      }

      return (
        <HeadingTag
          key={key}
          className={headingClasses[HeadingTag as keyof typeof headingClasses] || headingClasses.h2}
        >
          {renderedChildren.length > 0 ? renderedChildren : node.text || ""}
        </HeadingTag>
      )
    }

    case "paragraph": {
      // Empty paragraphs should still render as spacing
      if (renderedChildren.length === 0 && !node.text) {
        return <p key={key} className="mb-4 sm:mb-6 leading-relaxed">&nbsp;</p>
      }

      return (
        <p
          key={key}
          className="text-gray-700 mb-4 sm:mb-6 leading-relaxed text-base sm:text-lg"
        >
          {renderedChildren.length > 0 ? renderedChildren : node.text || ""}
        </p>
      )
    }

    case "list": {
      const listType = node.listType || "bullet"
      const ListTag = listType === "number" ? "ol" : "ul"
      const start = node.start || undefined

      return (
        <ListTag
          key={key}
          className={`${
            listType === "number"
              ? "list-decimal ml-6 sm:ml-8"
              : "list-disc ml-6 sm:ml-8"
          } mb-4 sm:mb-6 space-y-2 text-gray-700`}
          start={start}
        >
          {children.map((listItem, idx) => {
            // Separate nested lists from text content
            const nestedListNodes: LexicalNode[] = []
            const textNodes: LexicalNode[] = []

            if (listItem.children) {
              listItem.children.forEach((child) => {
                if (child.type === "list") {
                  nestedListNodes.push(child)
                } else {
                  textNodes.push(child)
                }
              })
            }

            // Render text content (handles formatting, links, etc.)
            const textContent = textNodes.length > 0
              ? renderChildren(textNodes, `list-${key}-${idx}-text`)
              : listItem.text !== undefined
              ? [renderFormattedText(listItem, `list-${key}-${idx}-text`)]
              : []

            // Render nested lists recursively
            const nestedLists = nestedListNodes.map((nestedList, nestedIdx) => {
              // Generate a unique numeric key for nested lists
              const nestedKey = (key * 1000) + (idx * 100) + nestedIdx
              return renderLexicalNode(nestedList, nestedKey)
            })

            return (
              <li
                key={`list-${key}-${idx}`}
                className="text-gray-700 leading-relaxed"
              >
                {textContent.length > 0 && <span>{textContent}</span>}
                {nestedLists.length > 0 && (
                  <div className="mt-2 ml-4">{nestedLists}</div>
                )}
              </li>
            )
          })}
        </ListTag>
      )
    }

    case "listitem": {
      // List items are handled by parent list, but handle standalone items
      const itemChildren = renderedChildren.length > 0
        ? renderedChildren
        : node.text
        ? [renderFormattedText(node, key)]
        : []

      return (
        <li key={key} className="text-gray-700 leading-relaxed">
          {itemChildren}
        </li>
      )
    }

    case "quote":
    case "blockquote": {
      const quoteChildren = renderedChildren.length > 0
        ? renderedChildren
        : node.text
        ? [renderFormattedText(node, key)]
        : []

      return (
        <blockquote
          key={key}
          className="border-l-4 border-gray-300 pl-4 sm:pl-6 pr-4 sm:pr-6 py-2 sm:py-3 my-4 sm:my-6 italic text-gray-600 bg-gray-50 rounded-r-lg leading-relaxed"
        >
          {quoteChildren}
        </blockquote>
      )
    }

    case "code": {
      // Code block (not inline code)
      const codeText = node.text || extractTextFromNode(node)
      return (
        <pre
          key={key}
          className="bg-gray-900 text-gray-100 p-4 sm:p-6 rounded-lg overflow-x-auto mb-4 sm:mb-6 text-sm sm:text-base font-mono leading-relaxed"
        >
          <code>{codeText}</code>
        </pre>
      )
    }

    case "linebreak": {
      return <br key={key} />
    }

    case "horizontalrule":
    case "hr": {
      return (
        <hr
          key={key}
          className="border-0 border-t border-gray-300 my-6 sm:my-8"
        />
      )
    }

    default: {
      // Handle unknown node types - try to render children or text
      if (renderedChildren.length > 0) {
        return (
          <div key={key} className="mb-4 sm:mb-6 leading-relaxed">
            {renderedChildren}
          </div>
        )
      }

      if (node.text) {
        return (
          <p
            key={key}
            className="text-gray-700 mb-4 sm:mb-6 leading-relaxed text-base sm:text-lg"
          >
            {renderFormattedText(node, key)}
          </p>
        )
      }

      // Skip empty nodes
      return null
    }
  }
}

/**
 * Extract all text from a node recursively (fallback)
 */
function extractTextFromNode(node: LexicalNode): string {
  if (node.text) return node.text
  if (node.children) {
    return node.children.map(extractTextFromNode).join("")
  }
  return ""
}

/**
 * LexicalContent - Comprehensive renderer for Payload CMS Lexical rich text
 * 
 * Preserves all formatting including:
 * - Paragraph breaks and line spacing
 * - Bold, italic, strikethrough, underline, code
 * - Headings (H1-H6)
 * - Bullet and numbered lists (with nesting support)
 * - Hyperlinks (inline and block)
 * - Blockquotes
 * - Code blocks and inline code
 * - Horizontal rules
 */
export function LexicalContent({ content, className = "" }: LexicalContentProps) {
  if (!content) {
    return (
      <Muted className="text-gray-500 italic">
        Content not available
      </Muted>
    )
  }

  // Handle different content formats
  let root: LexicalNode | null = null

  if (content.root) {
    root = content.root
  } else if (content.children) {
    // Some formats have children directly
    root = { children: content.children, type: "root" }
  } else if (Array.isArray(content)) {
    root = { children: content, type: "root" }
  }

  if (!root || !root.children || root.children.length === 0) {
    return (
      <Muted className="text-gray-500 italic">
        Content not available
      </Muted>
    )
  }

  const nodes = root.children

  return (
    <div className={`blog-content space-y-4 sm:space-y-6 ${className}`}>
      {nodes.map((node: LexicalNode, index: number) =>
        renderLexicalNode(node, index)
      )}
    </div>
  )
}
