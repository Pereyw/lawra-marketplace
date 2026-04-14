'use client';

import { Header } from '@/components/header';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Help Center</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I create an account?</h3>
                <p className="text-gray-700">
                  Click on the "Register" button and choose your role. Fill in the required information 
                  and verify your email to get started.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I list my products or services?</h3>
                <p className="text-gray-700">
                  Log in to your account, navigate to your dashboard, and click "Create Listing". 
                  Add descriptions, images, and pricing information.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What payment methods are accepted?</h3>
                <p className="text-gray-700">
                  We accept credit cards, debit cards, mobile money transfers, and cash payments.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How can I verify my seller account?</h3>
                <p className="text-gray-700">
                  Visit your dashboard and upload required documents. Our team will review and verify 
                  your account within 24-48 hours.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-8">
            <p className="text-gray-700">
              For more help, please contact our support team at support@lawramarketplace.com
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
