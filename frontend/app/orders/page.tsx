'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { loadUserOrders } from '@/lib/local-orders';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order } from '@/types';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setOrders(loadUserOrders(user.id));
  }, [user]);

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageTransition direction="up">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-slideInUp">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Please log in to view your orders</h1>
            <p className="text-gray-600 mb-8" style={{ animationDelay: '150ms' }}>Order history is saved once a purchase is completed.</p>
            <div className="flex justify-center gap-4 animate-slideInUp" style={{ animationDelay: '300ms' }}>
              <Link href="/auth/login">
                <Button>Login</Button>
              </Link>
              <Link href="/products">
                <Button variant="outline">Browse Products</Button>
              </Link>
            </div>
          </div>
        </PageTransition>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTransition direction="up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <FadeIn>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-slideInUp">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="mt-2 text-gray-600">Review order history, payment status, and delivery progress.</p>
              </div>
              <Link href="/products">
                <Button>Shop More</Button>
              </Link>
            </div>
          </FadeIn>

          {orders.length === 0 ? (
            <FadeIn delay={100}>
              <div className="mt-12 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center animate-popIn">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No orders yet</h2>
                <p className="text-gray-600 mb-6">When you checkout, your orders will appear here.</p>
                <Link href="/products">
                  <Button>Browse Products</Button>
                </Link>
              </div>
            </FadeIn>
          ) : (
            <StaggerContainer>
              <div className="mt-8 space-y-6">
                {orders.map((order, idx) => (
                  <StaggerItem key={order.id} index={idx}>
                    <Card className="hover-lift">
                      <CardHeader>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <CardTitle>Order #{order.reference}</CardTitle>
                            <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                              {order.status}
                            </span>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                              {order.paymentStatus.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Items</span>
                            <span>{order.items.reduce((count, item) => count + item.quantity, 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Shipping</span>
                            <span>₵{order.shippingCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Tax</span>
                            <span>₵{order.tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold text-gray-900">
                            <span>Total</span>
                            <span>₵{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <div>
                            <p className="text-sm text-gray-500">Payment method</p>
                            <p className="font-medium text-gray-900 capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Shipping</p>
                            <p className="text-gray-900">{order.shipping.address}, {order.shipping.city}, {order.shipping.region}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Customer</p>
                            <p className="text-gray-900">{order.shipping.firstName} {order.shipping.lastName}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
