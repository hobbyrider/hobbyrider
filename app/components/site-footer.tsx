import Link from "next/link"
import { Text, Muted, Caption, SmallHeading } from "@/app/components/typography"

export function SiteFooter() {
  return (
    <footer className="mt-12 sm:mt-20 border-t border-gray-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8">
          <div>
            <Text className="mb-2 text-gray-600">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-gray-900">hobbyrider</span>
            </Text>
            <Muted className="mb-2 text-sm">
              Built by builders, for builders.
            </Muted>
            <Caption className="text-gray-400">
              <Link
                href="/admin/moderation"
                className="transition-colors hover:text-gray-600 hover:underline underline-offset-2"
              >
                Admin-only
              </Link>
            </Caption>
          </div>

          <nav className="contents" aria-label="Footer navigation">
            <div>
              <SmallHeading className="mb-2 text-gray-500">
                Navigation
              </SmallHeading>
              <ul className="flex flex-col gap-2 text-sm">
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
                    href="/search"
                    className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                  >
                    Search
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <SmallHeading className="mb-2 text-gray-500">
                Product
              </SmallHeading>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                  >
                    Pricing
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
                    href="/submit"
                    className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                  >
                    Submit a product
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
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Link
                href="/privacy"
                className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
              >
                Terms of Service
              </Link>
              <Link
                href="/llms.txt"
                className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
              >
                llms.txt
              </Link>
              <Link
                href="/faq"
                className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
              >
                FAQ
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <a
                href="mailto:team@hobbyrider.io"
                className="text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
              >
                Contact us: team@hobbyrider.io
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
