'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { PageTransition, StaggerItem, FadeIn } from '@/components/ui/page-transition';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <PageTransition direction="up">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl animate-slideInUp">
              Welcome to Lawra Marketplace
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto animate-slideInUp" style={{ animationDelay: '150ms' }}>
              Connect with local landlords, artisans, and service providers in your community.
              Find housing, buy local products, and hire trusted professionals.
            </p>
            <div className="mt-8 flex justify-center space-x-4 animate-slideInUp" style={{ animationDelay: '300ms' }}>
              <Link href="/properties">
                <Button size="lg">Browse Properties</Button>
              </Link>
              <Link href="/artisans">
                <Button size="lg" variant="outline">Find Artisans</Button>
              </Link>
            </div>
          </div>
        </PageTransition>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <StaggerItem index={0}>
            <FadeIn delay={0}>
              <div className="text-center animate-slideInUp hover-lift">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Find Housing</h3>
                <p className="mt-2 text-gray-600">
                  Discover rental properties from verified landlords in your area.
                </p>
              </div>
            </FadeIn>
          </StaggerItem>

          <StaggerItem index={1}>
            <FadeIn delay={100}>
              <div className="text-center animate-slideInUp hover-lift">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
                  <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Local Artisans</h3>
                <p className="mt-2 text-gray-600">
                  Support local craftsmen and purchase authentic handmade products.
                </p>
              </div>
            </FadeIn>
          </StaggerItem>

          <StaggerItem index={2}>
            <FadeIn delay={200}>
              <div className="text-center animate-slideInUp hover-lift">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Professional Services</h3>
                <p className="mt-2 text-gray-600">
                  Hire trusted service providers for all your home and business needs.
                </p>
              </div>
            </FadeIn>
          </StaggerItem>
        </div>
      </main>
    </div>
  );
}