import type { Metadata } from "next"
import Link from "next/link"
import {
  PageTitle,
  SectionTitle,
  CardTitle,
  Text,
  Muted,
  Small,
  SmallHeading,
} from "@/app/components/typography"

export const metadata: Metadata = {
  title: "Pricing",
  description: "hobbyrider pricing - Free to list your software. More advertising options coming soon.",
  openGraph: {
    title: "Pricing · hobbyrider",
    description: "Free to list your software on hobbyrider. More advertising options coming soon.",
  },
}

export default function PricingPage() {
  return (
    <main className="px-6 py-10 md:py-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <PageTitle className="text-gray-900 md:text-5xl">
            Pricing
          </PageTitle>
          <Muted className="mt-4 text-xl">
            Simple, transparent pricing for makers
          </Muted>
        </header>

        {/* Main Pricing Card */}
        <div className="mb-16">
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm md:p-12">
            <div className="mb-6">
              <div className="mb-4 inline-block rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
                Free to Start
              </div>
              <SectionTitle className="text-3xl text-gray-900">
                List Your Software
              </SectionTitle>
              <Muted className="mt-2 text-lg">
                Share your product with thousands of builders and professionals actively discovering new software solutions
              </Muted>
            </div>

            <div className="mb-8 border-t border-gray-200 pt-8">
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-semibold text-gray-900">$0</span>
                  <span className="text-lg text-gray-600">to get started</span>
                </div>
                <Small className="mt-2 text-gray-500">
                  No credit card required. No hidden fees.
                </Small>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg
                    className="h-6 w-6 flex-shrink-0 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <Text className="text-gray-700">
                    <strong className="font-medium text-gray-900">Unlimited listings</strong> – Post as many products as you want
                  </Text>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="h-6 w-6 flex-shrink-0 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <Text className="text-gray-700">
                    <strong className="font-medium text-gray-900">Full product page</strong> – Complete control over your listing
                  </Text>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="h-6 w-6 flex-shrink-0 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <Text className="text-gray-700">
                    <strong className="font-medium text-gray-900">Community engagement</strong> – Get upvotes, comments, and feedback
                  </Text>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="h-6 w-6 flex-shrink-0 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <Text className="text-gray-700">
                    <strong className="font-medium text-gray-900">Analytics included</strong> – Track views, engagement, and more
                  </Text>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="h-6 w-6 flex-shrink-0 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <Text className="text-gray-700">
                    <strong className="font-medium text-gray-900">SEO optimized</strong> – Built-in search engine optimization
                  </Text>
                </li>
              </ul>

              <div className="mt-8">
                <Link
                  href="/submit"
                  className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                >
                  List Your Software
                  <svg
                    className="ml-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 md:p-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <CardTitle className="text-xl text-gray-900">Coming Soon</CardTitle>
          </div>
          <Text className="text-gray-700">
            We're working on additional advertising and promotion options to help you reach even more potential users. 
            These will include featured placements, promoted listings, and other tools to boost your visibility. 
            Stay tuned for updates!
          </Text>
          <div className="mt-6">
            <Small className="text-gray-600">
              Want to be notified when new options are available?{" "}
              <Link
                href="/submit"
                className="font-medium text-gray-900 underline hover:text-gray-700"
              >
                Submit your product
              </Link>{" "}
              and we'll keep you in the loop.
            </Small>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <SectionTitle className="mb-8 text-gray-900">Frequently Asked Questions</SectionTitle>
          <div className="space-y-8">
            <div>
              <CardTitle className="mb-2 text-gray-900">
                Is it free to list my software?
              </CardTitle>
              <Text className="text-gray-700">
                Yes! Currently, listing your software on hobbyrider is completely free. 
                You can create product listings at no cost. We may introduce different tiers 
                with additional features in the future, but basic listings will always be available.
              </Text>
            </div>
            <div>
              <CardTitle className="mb-2 text-gray-900">
                What do I get with a free listing?
              </CardTitle>
              <Text className="text-gray-700">
                You get a full product page with all the details about your software, community engagement 
                features (upvotes, comments), analytics to track views and engagement, and SEO optimization 
                to help people discover your product.
              </Text>
            </div>
            <div>
              <CardTitle className="mb-2 text-gray-900">
                What advertising options are coming?
              </CardTitle>
              <Text className="text-gray-700">
                We're planning to introduce optional paid features like featured placements, promoted listings, 
                and enhanced visibility options. We may also introduce different tiers with additional functionality. 
                These will be clearly communicated when available.
              </Text>
            </div>
            <div>
              <CardTitle className="mb-2 text-gray-900">
                Do you take any commission from sales?
              </CardTitle>
              <Text className="text-gray-700">
                No. hobbyrider doesn't take any commission from your sales or subscriptions. 
                We're here to help you get discovered, not to take a cut of your business.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
