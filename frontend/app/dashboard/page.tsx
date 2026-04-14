'use client';

import { useAuth } from '@/lib/auth-context';
import { LandlordDashboard } from '@/components/dashboard/landlord-dashboard';
import { ArtisanDashboard } from '@/components/dashboard/artisan-dashboard';
import { ServiceProviderDashboard } from '@/components/dashboard/service-provider-dashboard';
import { CustomerDashboard } from '@/components/dashboard/customer-dashboard';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { PageTransition, FadeIn } from '@/components/ui/page-transition';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageTransition direction="up">
          <FadeIn>
            <div className="text-center animate-slideInUp">
              <h2 className="text-2xl font-bold text-gray-900">Please log in to access your dashboard</h2>
            </div>
          </FadeIn>
        </PageTransition>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'landlord':
        return <LandlordDashboard />;
      case 'artisan':
        return <ArtisanDashboard />;
      case 'service_provider':
        return <ServiceProviderDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <PageTransition direction="up">
      <div className="min-h-screen bg-gray-50">
        {renderDashboard()}
      </div>
    </PageTransition>
  );
}