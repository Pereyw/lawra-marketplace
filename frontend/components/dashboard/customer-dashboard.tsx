'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { bookingsApi } from '@/lib/api';
import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';

export function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingsApi.getUserBookings();
      setBookings((response.data.data as any) || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header showAuth={false} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/properties">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-center">Find Housing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600">Browse available rental properties</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/artisans">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-center">Shop Local</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600">Discover artisan products and services</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/services">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-center">Book Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600">Hire professional service providers</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Your Bookings</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Track your property bookings and service requests.
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {loading ? (
                <li className="px-4 py-4 sm:px-6">
                  <div className="text-center text-gray-500">Loading bookings...</div>
                </li>
              ) : bookings.length === 0 ? (
                <li className="px-4 py-4 sm:px-6">
                  <div className="text-center text-gray-500">
                    No bookings found. Start by browsing{' '}
                    <Link href="/properties" className="text-primary-600 hover:text-primary-500">
                      properties
                    </Link>{' '}
                    or{' '}
                    <Link href="/services" className="text-primary-600 hover:text-primary-500">
                      services
                    </Link>
                  </div>
                </li>
              ) : (
                bookings.map((booking) => (
                  <li key={booking.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {booking.property?.title || booking.service?.service_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Booked on {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : booking.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}