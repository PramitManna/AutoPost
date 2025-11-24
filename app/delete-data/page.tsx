export default function DataDeletionPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Data Deletion Request
        </h1>
        
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              How We Handle Your Data
            </h2>
            <p>
              At RealtyGenie AutoPost, we take your privacy seriously. When you use our service:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2 ml-2">
              <li>Social media tokens are used only for posting functionality</li>
              <li>No personal data is stored permanently</li>
              <li>Images are automatically deleted after posting</li>
              <li>All data is handled securely and never shared with third parties</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Requesting Data Deletion
            </h2>
            <p>
              If you want to delete your data or disconnect from AutoPost, you have two options:
            </p>
            <div className="mt-3 space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Option 1: Disconnect from Meta
                </h3>
                <p className="text-sm">
                  Go to your Meta account settings and revoke access to RealtyGenie AutoPost. This will immediately stop any data sharing.
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Option 2: Contact Us
                </h3>
                <p className="text-sm">
                  Email us at <b>info@realtygenie.co</b> with your request to delete all associated data.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Data Deletion Endpoint
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              For automated deletion requests (GDPR/CCPA):
            </p>
            <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono text-sm break-all">
              POST {baseUrl}/api/user/delete-data
            </code>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Questions?
            </h2>
            <p>
              Contact us at: <b>info@realtygenie.co</b>
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
          <p>Last updated: November 24, 2025</p>
        </div>
      </div>
    </main>
  );
}
