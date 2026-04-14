import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { PageTransition, FadeIn } from '@/components/ui/page-transition';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <Header />

      <PageTransition direction="up">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <FadeIn>
            <div className="rounded-3xl border border-gray-200 bg-white/90 p-10 shadow-xl animate-popIn">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600 mb-6 animate-slideInUp">
                Service unavailable
              </p>
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4 animate-slideInUp" style={{ animationDelay: '150ms' }}>
                Sorry, this service is not available
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-slideInUp" style={{ animationDelay: '300ms' }}>
                Sorry we don't render such service or service is unavailable
              </p>

              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-slideInUp" style={{ animationDelay: '450ms' }}>
                <Link href="/">
                  <Button className="w-full sm:w-auto">Go back home</Button>
                </Link>
                <Link href="/properties">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Browse available properties
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>
        </main>
      </PageTransition>
    </div>
  );
}
