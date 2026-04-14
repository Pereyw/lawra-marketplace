'use client';

import { Header } from '@/components/header';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700">
              By accessing and using the Lawra Marketplace website and services, you accept and agree to 
              be bound by and comply with the terms and provision of this agreement.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Representations</h2>
            <p className="text-gray-700 mb-3">By using the Site, you represent and warrant that:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>All registration information you submit is true and accurate</li>
              <li>You will maintain the accuracy of such information</li>
              <li>You have the legal capacity to enter into this agreement</li>
              <li>You are not under the age of 13</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Rights and Restrictions</h2>
            <p className="text-gray-700 mb-3">Subject to these Terms of Service, we grant you a limited, non-exclusive, non-transferable license to access and use the Site.</p>
            <p className="text-gray-700">
              You shall not reproduce, redistribute, transmit, assign, sublicense, or transfer any rights 
              to or interests in the content or services without our prior written consent.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Products and Pricing</h2>
            <p className="text-gray-700">
              All products and services listed on Lawra Marketplace are subject to availability. 
              We reserve the right to limit quantities and correct pricing errors.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Limitation of Liability</h2>
            <p className="text-gray-700">
              In no case shall Lawra Marketplace, its suppliers, or other related parties be liable for any damages 
              (including, without limitation, damages for loss of data or profit, or due to business interruption) 
              arising out of the use or inability to use the services or content.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Information</h2>
            <p className="text-gray-700">
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              <a href="mailto:legal@lawramarketplace.com" className="text-primary-600 hover:underline">
                legal@lawramarketplace.com
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
