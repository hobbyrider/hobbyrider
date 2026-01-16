import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-base text-gray-600">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-gray-900">hobbyrider</span>
            </p>
            <p className="mb-2 text-sm text-gray-500">
              Built for learning. Products and votes are for demonstration purposes.
            </p>
            <p className="text-xs text-gray-400">
              <Link
                href="/admin/moderation"
                className="transition-colors hover:text-gray-600 hover:underline underline-offset-2"
              >
                Admin-only
              </Link>
            </p>
          </div>

          <nav className="flex flex-col gap-4 sm:flex-row sm:gap-8" aria-label="Footer navigation">
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Navigation
              </h3>
              <ul className="flex flex-col gap-2 text-base">
                <li>
                  <Link
                    href="/"
                    className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                  >
                    Categories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search"
                    className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                  >
                    Search
                  </Link>
                </li>
                <li>
                  <Link
                    href="/submit"
                    className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                  >
                    Submit
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Product
              </h3>
              <ul className="flex flex-col gap-2 text-base">
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                  >
                    Pricing
                  </Link>
                </li>
                {/* Blog disabled (depends on PayloadCMS - see docs/archive/payloadcms/) */}
                {/* <li>
                  <Link
                    href="/blog"
                    className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                  >
                    Blog
                  </Link>
                </li> */}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Connect
              </h3>
              <ul className="flex flex-col gap-2 text-base">
                <li>
                  <a
                    href="mailto:bieliunas.evaldas@gmail.com"
                    className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                  >
                    Email
                  </a>
                </li>
                <li>
                  <span className="text-gray-600">
                    X (Twitter)
                  </span>
                </li>
                <li>
                  <span className="text-gray-600">
                    LinkedIn
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Legal
              </h3>
              <ul className="flex flex-col gap-2 text-base">
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  )
}
