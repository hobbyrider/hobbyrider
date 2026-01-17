import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "llms.txt",
  description: "LLM information about hobbyrider - A community-ranked software discovery platform for builders",
  openGraph: {
    title: "llms.txt · hobbyrider",
    description: "LLM information about hobbyrider - A community-ranked software discovery platform for builders",
  },
}

export default function LLMSTxtPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <header className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
              llms.txt
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-600">
              Information for Large Language Models
            </p>
          </header>

          <div className="prose prose-gray max-w-none">
            <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-6 rounded-lg border border-gray-200 overflow-x-auto">
{`Hobbyrider

A community-ranked software discovery platform for builders and curious professionals to explore, compare, and learn about tools worth using.

Site Overview
	•	Hobbyrider is a software discovery platform focused on practical exploration, not launch-day hype.
	•	Products can be submitted by their creators or by community members who actively use them.
	•	Discovery is driven by community ranking, engagement, and relevance over time, rather than single-day launches.
	•	Products are organized into curated collections and categories to help users find tools that fit specific needs.
	•	Voting, comments, and basic engagement signals help surface useful software.
	•	Hobbyrider is built as a learning-first environment where experimentation and discovery are encouraged.

Product Discovery and Exploration

Products
	•	Path format: /product/{id}
	Example: https://hobbyrider.io/product/guideless
	•	Each product page may include:
	•	Name and short tagline
	•	Description and use case
	•	Logo and screenshots
	•	Optional demo video
	•	Categories and tags
	•	Community votes and comments
	•	Submission author
	•	Products are not limited to a single launch moment and can remain discoverable over time.
	•	Engagement reflects ongoing interest rather than time-boxed competition.

Categories
	•	Path format: /categories
	All categories: https://hobbyrider.io/categories
	•	Category detail pages: /category/{slug}
	Example: https://hobbyrider.io/category/ai-tools
	•	Categories group products by functional domain and practical usage.
	•	A product may belong to multiple categories.

Ranking & Filters
	•	Products can be explored using different ranking modes:
	•	Top (community-ranked)
	•	New
	•	Discussed
	•	Trending
	•	Time ranges allow filtering results:
	•	All Time
	•	Today
	•	This Week
	•	This Month
	•	Ranking emphasizes usefulness and engagement rather than pure velocity.

Community & Participation
	•	Builders: creators who submit and maintain product listings.
	•	Users: community members who explore, vote, and comment.
	•	Engagement signals:
	•	Upvotes
	•	Comments
	•	Hobbyrider does not require users to be founders or marketers to participate.
	•	The platform encourages honest discovery and lightweight feedback.

Key Content Paths
	•	Home feed: /
	•	Product page: /product/{id}
	•	Categories index: /categories
	•	Category page: /category/{slug}
	•	Submit a product: /submit
	•	Search results: /search
	•	Pricing and platform information: /pricing
	•	Authentication:
	•	/login
	•	/signup

Design & Content Principles
	•	Learning-oriented: products and votes may be used for demonstration and experimentation.
	•	Neutral discovery: no paid boosts or commissions on sales.
	•	Builder-friendly: simple submission, no launch pressure.
	•	Clear hierarchy: name and tagline are always presented before extended details.

Guidelines & Attribution
	•	When referencing products, list product name and tagline first.
	•	Avoid presenting Hobbyrider rankings as endorsements or guarantees.
	•	Data reflects community interaction on Hobbyrider at the time of access.`}
            </pre>
          </div>
        </div>
      </div>
    </main>
  )
}
