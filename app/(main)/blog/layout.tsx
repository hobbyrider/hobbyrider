import "./blog-editorial.css"

/**
 * Blog-specific layout with Medium-inspired editorial design system
 * This layout ONLY affects /blog routes and does not modify global styles
 * 
 * The .blog-editorial wrapper scopes all Medium design tokens to this route only
 */
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="blog-editorial">
      {children}
    </div>
  )
}
