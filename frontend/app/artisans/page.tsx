'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageTransition, FadeIn } from '@/components/ui/page-transition';

export default function ArtisansPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <PageTransition direction="up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <FadeIn>
            <div className="text-center mb-12 animate-slideInUp">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Find Local Artisans
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8" style={{ animationDelay: '150ms' }}>
                Discover and support talented local artisans in your community
              </p>
              
              <div className="flex gap-4 max-w-md mx-auto animate-slideInUp" style={{ animationDelay: '300ms' }}>
                <Input
                  type="text"
                  placeholder="Search artisans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button>Search</Button>
              </div>
            </div>

            <div className="text-center py-12 animate-pulse-gentle">
              <p className="text-gray-600 text-lg">
                Loading artisans...
              </p>
            </div>
          </FadeIn>
        </div>
      </PageTransition>
    </div>
  );
}
