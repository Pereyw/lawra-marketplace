'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { loadUserOrders } from '@/lib/local-orders';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageTransition, FadeIn } from '@/components/ui/page-transition';

export default function AccountPage() {
  const { user, loading, updateProfile } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfile({
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  }, [user]);

  const orderCount = useMemo(() => {
    if (!user) return 0;
    return loadUserOrders(user.id).length;
  }, [user]);

  const handleUpdate = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateProfile(profile);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageTransition direction="up">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-slideInUp">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Please log in to manage your account</h1>
            <p className="text-gray-600 mb-8" style={{ animationDelay: '150ms' }}>
              You can view your profile details, update contact info, and track orders from here.
            </p>
            <div className="flex justify-center gap-4 animate-slideInUp" style={{ animationDelay: '300ms' }}>
              <Link href="/auth/login">
                <Button>Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline">Sign Up</Button>
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
          <div className="grid gap-8 xl:grid-cols-3">
            <FadeIn delay={0}>
              <Card className="xl:col-span-1">
                <CardHeader>
                  <CardTitle>Account Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{user?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium text-gray-900 capitalize">{user?.role}</p>
                  </div>
                  <div className="space-y-2 pt-4">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{orderCount}</p>
                  </div>
                  <Link href="/orders">
                    <Button className="w-full">View order history</Button>
                  </Link>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={100}>
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => handleUpdate('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        onChange={(e) => handleUpdate('email', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => handleUpdate('phone', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Button onClick={handleSave}>Save Profile</Button>
                    {saved && <p className="text-sm text-green-700">Profile updated locally.</p>}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
