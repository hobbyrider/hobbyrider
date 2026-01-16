import type { Metadata } from "next"
import { PageTitle, SectionTitle, CardTitle, Text, Muted } from "@/app/components/typography"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for hobbyrider - Read our terms and conditions for using the platform.",
}

export default function TermsPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <PageTitle className="text-3xl text-gray-900">
            Terms of Service
          </PageTitle>
          <Muted className="mt-2">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </Muted>
        </header>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <SectionTitle className="text-xl text-gray-900 mb-4">1. Acceptance of Terms</SectionTitle>
            <Text className="text-gray-700 mb-4">
              By accessing or using hobbyrider ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </Text>
          </section>

          <section className="mb-8">
            <SectionTitle className="text-xl text-gray-900 mb-4">2. Description of Service</SectionTitle>
            <Text className="text-gray-700 mb-4">
              hobbyrider is a platform for discovering and sharing software products. Users can submit products, upvote content, leave comments, and interact with the community. The Service is provided "as is" and "as available."
            </Text>
          </section>

          <section className="mb-8">
            <SectionTitle className="text-xl text-gray-900 mb-4">3. User Accounts</SectionTitle>
            
            <CardTitle className="text-lg font-medium text-gray-800 mb-3">3.1 Registration</CardTitle>
            <Text className="text-gray-700 mb-4">
              To use certain features of the Service, you must register for an account. You agree to:
            </Text>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li className="text-gray-700">Provide accurate, current, and complete information</li>
              <li className="text-gray-700">Maintain and update your information to keep it accurate</li>
              <li className="text-gray-700">Maintain the security of your password</li>
              <li className="text-gray-700">Accept responsibility for all activities under your account</li>
              <li className="text-gray-700">Notify us immediately of any unauthorized use</li>
            </ul>

            <CardTitle className="text-lg font-medium text-gray-800 mb-3">3.2 Account Termination</CardTitle>
            <Text className="text-gray-700 mb-4">
              We reserve the right to suspend or terminate your account at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
            </Text>
          </section>

          <section className="mb-8">
            <SectionTitle className="text-xl text-gray-900 mb-4">4. User Conduct</SectionTitle>
            <Text className="text-gray-700 mb-4">You agree not to:</Text>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li className="text-gray-700">Submit false, misleading, or fraudulent information</li>
              <li className="text-gray-700">Submit content that is illegal, harmful, threatening, abusive, or violates any laws</li>
              <li className="text-gray-700">Submit content that infringes on intellectual property rights</li>
              <li className="text-gray-700">Submit spam, unsolicited promotional content, or engage in any form of automated data collection</li>
              <li className="text-gray-700">Impersonate any person or entity or misrepresent your affiliation</li>
              <li className="text-gray-700">Interfere with or disrupt the Service or servers</li>
              <li className="text-gray-700">Attempt to gain unauthorized access to any part of the Service</li>
              <li className="text-gray-700">Use the Service for any commercial purpose without our express written consent</li>
              <li className="text-gray-700">Harass, abuse, or harm other users</li>
            </ul>
          </section>

          <section className="mb-8">
            <SectionTitle className="text-xl text-gray-900 mb-4">5. Content Ownership and License</SectionTitle>
            
            <CardTitle className="text-lg font-medium text-gray-800 mb-3">5.1 Your Content</CardTitle>
            <Text className="text-gray-700 mb-4">
              You retain ownership of any content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and distribute your content on the Service.
            </Text>

            <CardTitle className="text-lg font-medium text-gray-800 mb-3">5.2 Our Content</CardTitle>
            <Text className="text-gray-700 mb-4">
              The Service and its original content, features, and functionality are owned by hobbyrider and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </Text>
          </section>

          <section className="mb-8">
            <SectionTitle className="text-xl text-gray-900 mb-4">6. Product Submissions</SectionTitle>
            <Text className="text-gray-700 mb-4">
              When you submit a product to the Service, you represent and warrant that:
            </Text>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li className="text-gray-700">You have the right to submit the product and all associated content</li>
              <li className="text-gray-700">The product and content do not infringe on any third-party rights</li>
              <li className="text-gray-700">The information provided is accurate and not misleading</li>
              <li className="text-gray-700">You are authorized to represent the product or have permission from the product owner</li>
            </ul>
            <Text className="text-gray-700 mb-4">
              We reserve the right to remove any product submission that violates these Terms or our community guidelines.
            </Text>
          </section>

          <section className="mb-8">
            <SectionTitle className="text-xl text-gray-900 mb-4">7. Moderation and Content Removal</SectionTitle>
            <Text className="text-gray-700 mb-4">
              We reserve the right to review, edit, or remove any content that, in our sole judgment, violates these Terms, is objectionable, or may expose us or our users to harm. We are not obligated to monitor content but may do so at our discretion.
            </Text>
          </section>

          <section className="mb-8">
            <SectionTitle className="text-xl text-gray-900 mb-4">8. Intellectual Property</SectionTitle>
            <Text className="text-gray-700 mb-4">
              If you believe that any content on the Service infringes your copyright or other intellectual property rights, please contact us at{" "}
              <a href="mailto:team@hobbyrider.io" className="text-gray-900 underline hover:text-gray-700">
                team@hobbyrider.io
              </a>{" "}
              with a detailed description of the alleged infringement.
            </Text>
          </section>

          <section className="mb-8">
            <SectionTitle className="text-xl text-gray-900 mb-4">9. Disclaimers</SectionTitle>
            <Text className="text-gray-700 mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </Text>
            <Text className="text-gray-700 mb-4">
              We do not warrant that the Service will be uninterrupted, secure, or error-free. We do not endorse or assume responsibility for any products, services, or content submitted by users.
            </Text>
          </section>

          <section className="mb-8">
            <SectionTitle className="text-xl text-gray-900 mb-4">10. Limitation of Liability</SectionTitle>
            <Text className="text-gray-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
            </Text>
          </section>

          <section className="mb-8">
            <SectionTitle className="text-xl text-gray-900 mb-4">11. Indemnification</SectionTitle>
            <Text className="text-gray-700 mb-4">
              You agree to indemnify and hold harmless hobbyrider, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of your use of the Service, your violation of these Terms, or your violation of any rights of another.
            </Text>
          </section>

          <section className="mb-8">
            <SectionTitle className="text-xl text-gray-900 mb-4">12. Changes to Terms</SectionTitle>
            <Text className="text-gray-700 mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </Text>
            <Text className="text-gray-700 mb-4">
              By continuing to access or use the Service after those revisions become effective, you agree to be bound by the revised terms.
            </Text>
          </section>

          <section className="mb-8">
            <SectionTitle className="text-xl text-gray-900 mb-4">13. Governing Law</SectionTitle>
            <Text className="text-gray-700 mb-4">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in the applicable jurisdiction.
            </Text>
          </section>

          <section className="mb-8">
            <SectionTitle className="text-xl text-gray-900 mb-4">14. Severability</SectionTitle>
            <Text className="text-gray-700 mb-4">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </Text>
          </section>

          <section className="mb-8">
            <SectionTitle className="text-xl text-gray-900 mb-4">15. Contact Information</SectionTitle>
            <Text className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </Text>
            <Text className="text-gray-700">
              Email:{" "}
              <a href="mailto:team@hobbyrider.io" className="text-gray-900 underline hover:text-gray-700">
                team@hobbyrider.io
              </a>
            </Text>
          </section>
        </div>
      </div>
    </main>
  )
}
