'use client';

import { Header } from '@/components/header';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700">
              Lawra Marketplace ("we," "us," "our," or "Company") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 mb-3">We may collect information about you in a variety of ways:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Information you provide voluntarily</li>
              <li>Information collected automatically</li>
              <li>Information from third parties</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Use of Your Information</h2>
            <p className="text-gray-700 mb-3">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience.</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>To email regarding your account or order</li>
              <li>To fulfill and manage purchases, orders, and transactions</li>
              <li>To generate a personal profile about you</li>
              <li>To increase the efficiency and operation of our website</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Disclosure of Your Information</h2>
            <p className="text-gray-700">
              We may share information we have collected about you in certain situations, including without limitation:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-3">
              <li>By law or legal process</li>
              <li>For payment processing</li>
              <li>To protect our rights and safety</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contact Us</h2>
            <p className="text-gray-700">
              If you have questions or comments about this Privacy Policy, please contact us at:
              <br />
              <a href="mailto:privacy@lawramarketplace.com" className="text-primary-600 hover:underline">
                privacy@lawramarketplace.com
              </a>
            </p>
          </div>

          <div className="border-t pt-8">
            <p className="text-sm text-gray-600">
              Last updated: April 14, 2026
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
