import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for hobbyrider - Learn how we collect, use, and protect your data.",
}

export default function PrivacyPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Privacy Policy
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </header>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              Welcome to hobbyrider ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-base text-gray-700 space-y-2 mb-4">
              <li><strong>Account Information:</strong> When you register, we collect your name, email address, username, and password (hashed).</li>
              <li><strong>Profile Information:</strong> You may choose to provide additional information such as a profile picture, bio, headline, website, LinkedIn, and Twitter/X links.</li>
              <li><strong>Content:</strong> We collect the products you submit, comments you post, and any other content you create on the platform.</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-base text-gray-700 space-y-2 mb-4">
              <li><strong>Usage Data:</strong> We collect information about how you interact with our service, including pages visited, time spent, and actions taken.</li>
              <li><strong>Device Information:</strong> We may collect information about your device, browser type, and IP address.</li>
              <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to maintain your session and improve your experience.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-base text-gray-700 space-y-2 mb-4">
              <li>Provide, maintain, and improve our service</li>
              <li>Authenticate your identity and manage your account</li>
              <li>Process your submissions, comments, and interactions</li>
              <li>Send you important updates and notifications (if you opt in)</li>
              <li>Monitor and analyze usage patterns to improve our platform</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Storage and Security</h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal information. Your data is stored securely using industry-standard practices. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              Your data is stored on servers provided by our hosting partners (Vercel and our database provider). We retain your information for as long as your account is active or as needed to provide our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Third-Party Services</h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              We use third-party services that may collect information about you:
            </p>
            <ul className="list-disc list-inside text-base text-gray-700 space-y-2 mb-4">
              <li><strong>Authentication:</strong> We use NextAuth.js for authentication, which may integrate with Google OAuth and email providers.</li>
              <li><strong>File Storage:</strong> We use Vercel Blob for storing uploaded images and files.</li>
              <li><strong>Hosting:</strong> Our service is hosted on Vercel, which processes your requests.</li>
            </ul>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              These third parties have their own privacy policies, and we encourage you to review them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside text-base text-gray-700 space-y-2 mb-4">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              To exercise these rights, please contact us at{" "}
              <a href="mailto:bieliunas.evaldas@gmail.com" className="text-gray-900 underline hover:text-gray-700">
                bieliunas.evaldas@gmail.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Cookies</h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              We use cookies and similar technologies to maintain your session, remember your preferences, and analyze how you use our service. You can control cookies through your browser settings, but disabling cookies may affect your ability to use certain features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              Email:{" "}
              <a href="mailto:bieliunas.evaldas@gmail.com" className="text-gray-900 underline hover:text-gray-700">
                bieliunas.evaldas@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
