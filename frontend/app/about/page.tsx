'use client';

import { Header } from '@/components/header';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Lawra Marketplace</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <p className="text-lg text-gray-700">
            Lawra Marketplace is a community-based e-commerce platform designed to connect landlords, 
            artisans, and service providers with customers in the Lawra municipality.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
          <p className="text-gray-700">
            To empower local businesses and service providers by providing them with a digital platform 
            to reach more customers and grow their businesses sustainably.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900">What We Offer</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Property rental and management</li>
            <li>Local artisan products and services</li>
            <li>Professional services directory</li>
            <li>Secure payment and transaction processing</li>
            <li>Verified seller and provider network</li>
          </ul>
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
