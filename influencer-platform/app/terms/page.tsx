import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using the Influencer Management Platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). 
                If you do not agree to these Terms, please do not use our Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Platform Description</h2>
              <p className="text-gray-700 mb-4">
                Our Platform provides a marketplace connecting brands with social media influencers for marketing campaigns. 
                We facilitate the discovery, negotiation, and management of influencer marketing collaborations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.1 Registration</h3>
              <p className="text-gray-700 mb-4">
                To use our Platform, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.2 Account Types</h3>
              <p className="text-gray-700 mb-4">
                We offer different account types:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Influencer Accounts:</strong> For content creators seeking brand partnerships</li>
                <li><strong>Brand Accounts:</strong> For businesses seeking influencer collaborations</li>
                <li><strong>Admin Accounts:</strong> For platform administrators (internal use only)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Obligations</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">4.1 For All Users</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Comply with all applicable laws and regulations</li>
                <li>Not use the Platform for illegal or unauthorized purposes</li>
                <li>Not violate any third-party rights</li>
                <li>Not transmit harmful code or interfere with the Platform</li>
                <li>Not attempt to gain unauthorized access to any systems</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">4.2 For Influencers</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Accurately represent your social media metrics and audience</li>
                <li>Deliver content as agreed in campaign terms</li>
                <li>Disclose sponsored content according to FTC guidelines</li>
                <li>Maintain authenticity and not engage in fraudulent practices</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">4.3 For Brands</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Provide clear campaign requirements and expectations</li>
                <li>Make timely payments for approved work</li>
                <li>Respect influencer creative freedom within agreed parameters</li>
                <li>Not request content that violates platform policies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Campaign Management</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">5.1 Campaign Creation</h3>
              <p className="text-gray-700 mb-4">
                Brands may create campaigns with specific requirements, budgets, and deadlines. 
                All campaign details must be accurate and not misleading.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">5.2 Applications and Selection</h3>
              <p className="text-gray-700 mb-4">
                Influencers may apply to campaigns that match their profile. 
                Brands have sole discretion in selecting influencers for their campaigns.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">5.3 Content Submission</h3>
              <p className="text-gray-700 mb-4">
                Influencers must submit content links for verification. 
                Views and engagement metrics may be tracked through our Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment Terms</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">6.1 Payment Models</h3>
              <p className="text-gray-700 mb-4">
                We support various payment models including:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Fixed rate payments</li>
                <li>Cost per thousand views (CPM)</li>
                <li>Performance-based payments</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">6.2 Payment Processing</h3>
              <p className="text-gray-700 mb-4">
                Payments are processed through our Platform. 
                We may charge service fees for payment processing and platform usage.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">6.3 Refunds and Disputes</h3>
              <p className="text-gray-700 mb-4">
                Refund policies and dispute resolution procedures are outlined in our separate Payment Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">7.1 Platform Content</h3>
              <p className="text-gray-700 mb-4">
                All Platform content, features, and functionality are owned by us and are protected by copyright, 
                trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">7.2 User Content</h3>
              <p className="text-gray-700 mb-4">
                You retain ownership of content you submit to the Platform. 
                By submitting content, you grant us a worldwide, non-exclusive license to use, display, 
                and distribute your content in connection with the Platform.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">7.3 Campaign Content</h3>
              <p className="text-gray-700 mb-4">
                Content created for campaigns is subject to agreements between brands and influencers. 
                Usage rights should be clearly defined in campaign terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                Your use of the Platform is also governed by our Privacy Policy. 
                We are committed to protecting your personal information and complying with applicable data protection laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitations</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">9.1 Platform Availability</h3>
              <p className="text-gray-700 mb-4">
                We strive to maintain Platform availability but do not guarantee uninterrupted access. 
                We may modify or discontinue features without notice.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">9.2 Third-Party Services</h3>
              <p className="text-gray-700 mb-4">
                We integrate with third-party services (e.g., Instagram, TikTok) for data tracking. 
                We are not responsible for third-party service availability or accuracy.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">9.3 Limitation of Liability</h3>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law, we shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages resulting from your use of the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
              <p className="text-gray-700 mb-4">
                You agree to indemnify and hold us harmless from any claims, losses, liabilities, 
                damages, costs, and expenses arising from your violation of these Terms or your use of the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account immediately, without prior notice, for:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Harmful behavior toward other users</li>
                <li>At our sole discretion for any reason</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
                in which our company is registered, without regard to conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms at any time. 
                We will notify users of significant changes via email or Platform notification. 
                Continued use after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  Email: legal@influencerplatform.com<br />
                  Address: [Your Company Address]<br />
                  Phone: [Your Contact Number]
                </p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                By using our Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}