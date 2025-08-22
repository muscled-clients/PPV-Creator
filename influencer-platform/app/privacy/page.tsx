import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to the Influencer Management Platform ("we," "our," or "us"). 
                We are committed to protecting your personal information and your right to privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you use our Platform.
              </p>
              <p className="text-gray-700 mb-4">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
                please do not access the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">2.1 Personal Information You Provide</h3>
              <p className="text-gray-700 mb-4">We collect personal information that you voluntarily provide when you:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Register for an account</li>
                <li>Create or update your profile</li>
                <li>Apply for campaigns</li>
                <li>Contact us for support</li>
              </ul>
              
              <p className="text-gray-700 mb-4">This information includes:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, password, username</li>
                <li><strong>Profile Information:</strong> Bio, avatar, location, phone number</li>
                <li><strong>Social Media Data:</strong> Instagram handle, TikTok username, follower counts</li>
                <li><strong>Campaign Data:</strong> Applications, content links, performance metrics</li>
                <li><strong>Payment Information:</strong> Banking details, payment preferences (processed securely)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">2.2 Information Collected Automatically</h3>
              <p className="text-gray-700 mb-4">When you use our Platform, we automatically collect:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on Platform</li>
                <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                <li><strong>Log Data:</strong> Access times, error logs, referral sources</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">2.3 Information from Third Parties</h3>
              <p className="text-gray-700 mb-4">We may collect information from:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Social Media Platforms:</strong> Public profile data, content metrics (with your permission)</li>
                <li><strong>Analytics Providers:</strong> Usage patterns, demographic information</li>
                <li><strong>Payment Processors:</strong> Transaction confirmations (not full payment details)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use your information to:</p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.1 Provide Platform Services</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Create and manage your account</li>
                <li>Connect brands with influencers</li>
                <li>Process campaign applications</li>
                <li>Track content performance</li>
                <li>Facilitate payments</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.2 Improve Our Services</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Analyze usage patterns</li>
                <li>Develop new features</li>
                <li>Optimize user experience</li>
                <li>Conduct research and analytics</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.3 Communicate with You</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Send account notifications</li>
                <li>Provide customer support</li>
                <li>Send marketing communications (with consent)</li>
                <li>Deliver important Platform updates</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.4 Legal and Security</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and abuse</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect user safety and Platform security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Share Your Information</h2>
              <p className="text-gray-700 mb-4">We may share your information in the following situations:</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">4.1 With Other Users</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Public Profiles:</strong> Basic profile information visible to other users</li>
                <li><strong>Campaign Applications:</strong> Shared with relevant brands when you apply</li>
                <li><strong>Performance Metrics:</strong> Aggregate data may be shared anonymously</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">4.2 With Service Providers</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Payment processors for transactions</li>
                <li>Cloud storage providers for data hosting</li>
                <li>Analytics services for Platform improvement</li>
                <li>Email services for communications</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">4.3 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">
                We may disclose information if required by law, court order, or government request, 
                or if we believe disclosure is necessary to protect rights, property, or safety.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">4.4 Business Transfers</h3>
              <p className="text-gray-700 mb-4">
                In the event of a merger, acquisition, or sale of assets, 
                your information may be transferred to the acquiring entity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security audits and assessments</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="text-gray-700 mb-4">
                However, no method of transmission over the Internet is 100% secure. 
                While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Privacy Rights</h2>
              <p className="text-gray-700 mb-4">Depending on your location, you may have the following rights:</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">6.1 Access and Portability</h3>
              <p className="text-gray-700 mb-4">
                Request access to your personal information and receive it in a portable format.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">6.2 Correction and Update</h3>
              <p className="text-gray-700 mb-4">
                Request correction of inaccurate or incomplete personal information.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">6.3 Deletion</h3>
              <p className="text-gray-700 mb-4">
                Request deletion of your personal information, subject to legal requirements.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">6.4 Opt-Out</h3>
              <p className="text-gray-700 mb-4">
                Opt-out of marketing communications and certain data processing activities.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">6.5 Restriction</h3>
              <p className="text-gray-700 mb-4">
                Request restriction of processing of your personal information in certain circumstances.
              </p>

              <p className="text-gray-700 mb-4">
                To exercise these rights, please contact us at privacy@influencerplatform.com
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">We use cookies and similar tracking technologies to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Maintain user sessions</li>
                <li>Remember user preferences</li>
                <li>Analyze Platform usage</li>
                <li>Provide personalized experiences</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">7.1 Cookie Types</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for Platform functionality</li>
                <li><strong>Performance Cookies:</strong> Help us understand usage patterns</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and choices</li>
                <li><strong>Marketing Cookies:</strong> Used for targeted advertising (with consent)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">7.2 Managing Cookies</h3>
              <p className="text-gray-700 mb-4">
                You can control cookies through your browser settings. 
                Note that disabling cookies may affect Platform functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place for international transfers, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Standard contractual clauses</li>
                <li>Data processing agreements</li>
                <li>Compliance with applicable data protection laws</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our Platform is not intended for users under 18 years of age. 
                We do not knowingly collect personal information from children. 
                If we discover we have collected information from a child under 18, 
                we will delete it immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p className="text-gray-700 mb-4">
                When information is no longer needed, we securely delete or anonymize it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Third-Party Links</h2>
              <p className="text-gray-700 mb-4">
                Our Platform may contain links to third-party websites or services. 
                We are not responsible for the privacy practices of these third parties. 
                We encourage you to review their privacy policies before providing any information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. California Privacy Rights (CCPA)</h2>
              <p className="text-gray-700 mb-4">
                California residents have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to say no to the sale of personal information</li>
                <li>Right to equal service and price</li>
              </ul>
              <p className="text-gray-700 mb-4">
                We do not sell personal information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. European Privacy Rights (GDPR)</h2>
              <p className="text-gray-700 mb-4">
                If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Right to be informed</li>
                <li>Right of access</li>
                <li>Right to rectification</li>
                <li>Right to erasure</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object</li>
                <li>Rights related to automated decision-making</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Our legal basis for processing personal data includes consent, contract performance, 
                and legitimate interests.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Updates to Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. 
                We will notify you of material changes via email or Platform notification. 
                The "Last updated" date at the top indicates the most recent revision.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about this Privacy Policy or our privacy practices, please contact:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Data Protection Officer</strong><br />
                  Email: privacy@influencerplatform.com<br />
                  Address: [Your Company Address]<br />
                  Phone: [Your Contact Number]
                </p>
              </div>
              <p className="text-gray-700 mt-4">
                You also have the right to lodge a complaint with your local data protection authority.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                By using our Platform, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}