export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: November 24, 2025
        </p>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              1. Introduction
            </h2>
            <p>
              RealtyGenie AutoPost ("we," "us," "our," or "Company") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application and services.
            </p>
            <p className="mt-3">
              Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Services.
            </p>
          </section>

          {/* Data We Collect */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              2. Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  2.1 Information You Provide
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Meta/Facebook account credentials and authentication tokens</li>
                  <li>Instagram account information (if connected)</li>
                  <li>User preferences and settings</li>
                  <li>Communication data (support requests, feedback)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  2.2 Information Automatically Collected
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Device information (browser type, IP address)</li>
                  <li>Usage analytics (features used, session duration)</li>
                  <li>Log data and error information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              3. How We Use Your Information
            </h2>
            <p className="mb-3">We use collected information for:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Providing, maintaining, and improving our Services</li>
              <li>Processing your requests to post content to social media platforms</li>
              <li>Managing your account and authentication</li>
              <li>Sending service updates and support communications</li>
              <li>Analyzing usage patterns to improve user experience</li>
              <li>Complying with legal obligations</li>
              <li>Preventing fraud and ensuring security</li>
            </ul>
          </section>

          {/* Data Storage */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              4. Data Storage and Retention
            </h2>
            <div className="space-y-3">
              <p>
                <span className="font-semibold">Authentication Tokens:</span> Securely stored and used only to authenticate requests to Meta's API.
              </p>
              <p>
                <span className="font-semibold">Images:</span> Automatically deleted from our servers within 24 hours after successful posting or upon user request.
              </p>
              <p>
                <span className="font-semibold">User Data:</span> Retained only for as long as necessary to provide our Services or as required by law.
              </p>
              <p>
                <span className="font-semibold">Logs:</span> Server logs and analytics data are retained for 30 days.
              </p>
            </div>
          </section>

          {/* Sharing Data */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              5. Sharing Your Information
            </h2>
            <p className="mb-3">
              We do NOT sell, trade, or rent your personal information to third parties. We only share information as necessary:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><span className="font-semibold">Meta Platforms:</span> To authenticate and post content per your request</li>
              <li><span className="font-semibold">Service Providers:</span> Hosting providers, payment processors, and analytics services under strict confidentiality agreements</li>
              <li><span className="font-semibold">Legal Requirements:</span> When required by law or to protect our rights</li>
            </ul>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              6. Your Privacy Rights (GDPR & CCPA)
            </h2>
            <p className="mb-3">
              Depending on your location, you may have the following rights:
            </p>
            <div className="space-y-3 ml-4">
              <div>
                <p className="font-semibold">Right to Access:</p>
                <p>You can request a copy of your personal data we hold.</p>
              </div>
              <div>
                <p className="font-semibold">Right to Rectification:</p>
                <p>You can request corrections to inaccurate or incomplete data.</p>
              </div>
              <div>
                <p className="font-semibold">Right to Erasure ("Right to be Forgotten"):</p>
                <p>You can request deletion of your personal data, subject to certain exceptions.</p>
              </div>
              <div>
                <p className="font-semibold">Right to Data Portability:</p>
                <p>You can request your data in a portable format.</p>
              </div>
              <div>
                <p className="font-semibold">Right to Withdraw Consent:</p>
                <p>You can withdraw consent at any time by disconnecting your Meta account.</p>
              </div>
              <div>
                <p className="font-semibold">Right to Object:</p>
                <p>You can object to certain processing of your data.</p>
              </div>
            </div>
          </section>

          {/* Data Deletion */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              7. How to Request Data Deletion
            </h2>
            <p className="mb-3">
              To exercise your right to data deletion:
            </p>
            <div className="space-y-3 ml-4">
              <div>
                <p className="font-semibold mb-2">Option 1: Disconnect from Meta</p>
                <p>Revoke AutoPost access from your Meta account settings. This immediately stops data sharing and processing.</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Option 2: Contact Us</p>
                <p>Email us at <b>info@realtygenie.co</b> with your request to delete all associated data.</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Option 3: Automated Deletion Endpoint</p>
                <p>Send a request to our data deletion endpoint at:</p>
                <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono text-sm my-2 break-all">
                  https://auto-post-mu.vercel.app/api/user/delete-data
                </code>
                <p className="text-sm">
                  Learn more: <a href="/delete-data" className="text-blue-600 dark:text-blue-400 hover:underline">Data Deletion Policy</a>
                </p>
              </div>
            </div>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              8. Security Measures
            </h2>
            <p className="mb-3">
              We implement reasonable security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Encrypted transmission of sensitive data (HTTPS/TLS)</li>
              <li>Secure storage of authentication tokens</li>
              <li>Access controls and authentication requirements</li>
              <li>Regular security audits and monitoring</li>
              <li>Immediate data deletion after processing</li>
            </ul>
          </section>

          {/* Meta Specific */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              9. Meta Platform Integration
            </h2>
            <p className="mb-3">
              When you connect your Meta/Facebook and Instagram accounts:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>We request specific permissions to post content on your behalf</li>
              <li>Your credentials are used only for posting and are not shared</li>
              <li>You can revoke access at any time through your Meta account settings</li>
              <li>We comply with Meta's Platform Policies and Data Use Policy</li>
              <li>We do not access private messages, personal information, or payment data unless you explicitly grant permission</li>
            </ul>
          </section>

          {/* Third Party Links */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              10. Third-Party Links
            </h2>
            <p>
              Our application may contain links to third-party services. We are not responsible for the privacy practices of external sites. We encourage you to review their privacy policies before providing your information.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              11. Children's Privacy
            </h2>
            <p>
              Our Services are not intended for children under 13 years old. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will delete such information and terminate the child's account.
            </p>
          </section>

          {/* Policy Updates */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              12. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically. Changes will be effective immediately upon posting to the application. Your continued use of our Services constitutes your acceptance of the updated Privacy Policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              13. Contact Us
            </h2>
            <p className="mb-3">
              If you have questions about this Privacy Policy or our privacy practices:
            </p>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Email:</span> <b>info@realtygenie.co</b>
              </p>
              <p>
                <span className="font-semibold">Company:</span> RealtyGenie AutoPost
              </p>
              <p>
                <span className="font-semibold">Privacy Request:</span> <a href="/delete-data" className="text-blue-600 dark:text-blue-400 hover:underline">Data Deletion Request</a>
              </p>
            </div>
          </section>

          {/* GDPR Notice */}
          <section className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 dark:bg-green-900/10 rounded">
            <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
              GDPR Compliance Notice (EU Users)
            </h3>
            <p className="text-sm">
              We comply with the General Data Protection Regulation (GDPR). Your data is processed lawfully, fairly, and transparently. You have the right to access, rectify, erase, and port your data. For more information or to exercise your rights, please contact us.
            </p>
          </section>

          {/* CCPA Notice */}
          <section className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 dark:bg-orange-900/10 rounded">
            <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">
              CCPA Compliance Notice (California Users)
            </h3>
            <p className="text-sm">
              If you are a California resident, you have the right to know what personal information is collected, used, shared, or sold. You have the right to delete personal information collected and opt-out of sales. For more information, contact us at info@realtygenie.co.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 RealtyGenie AutoPost. All rights reserved.</p>
          <p className="mt-2">
            <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">Home</a> | 
            <a href="/delete-data" className="text-blue-600 dark:text-blue-400 hover:underline ml-2">Data Deletion</a>
          </p>
        </div>
      </div>
    </main>
  );
}
