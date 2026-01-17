import type { Metadata } from "next"
import {
  PageTitle,
  SectionTitle,
  CardTitle,
  Text,
  Muted,
} from "@/app/components/typography"

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about hobbyrider",
  openGraph: {
    title: "FAQ · hobbyrider",
    description: "Frequently asked questions about hobbyrider",
  },
}

export default function FAQPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <header className="mb-6 sm:mb-8">
            <PageTitle className="text-3xl sm:text-4xl md:text-5xl text-gray-900">
              Frequently Asked Questions
            </PageTitle>
            <Muted className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl">
              Everything you need to know about hobbyrider
            </Muted>
          </header>

          <div className="space-y-8 sm:space-y-10">
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
