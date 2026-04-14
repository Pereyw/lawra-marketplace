'use client';

import { useState, useEffect } from 'react';
import { analyticsApi } from '@/lib/api';
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Loader,
} from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));

      const response = await analyticsApi.getAdminStats(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      setStats(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
        {error}
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: <Calendar className="text-blue-600" />,
      trend: '+12%',
    },
    {
      label: 'Total Revenue',
      value: `GHS ${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: <DollarSign className="text-green-600" />,
      trend: '+8%',
    },
    {
      label: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: <Users className="text-purple-600" />,
      trend: '+5%',
    },
    {
      label: 'Top Performance',
      value: stats?.topVendors?.length || 0,
      icon: <TrendingUp className="text-orange-600" />,
      trend: 'Vendors',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Platform analytics and overview</p>

      {/* Date Range Selector */}
      <div className="mb-6 flex gap-2">
        <label className="block text-sm font-medium">Date Range:</label>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 text-sm font-medium">{kpi.label}</p>
              {kpi.icon}
            </div>
            <p className="text-3xl font-bold mb-2">{kpi.value}</p>
            <p className="text-xs text-green-600">{kpi.trend}</p>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-blue-600" />
            <h3 className="font-bold text-lg">Revenue Trend</h3>
          </div>
          <div className="h-48 bg-gray-50 rounded flex items-center justify-center text-gray-400">
            <p>Chart implementation pending</p>
          </div>
        </div>

        {/* Top Vendors */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">Top Vendors</h3>
          <div className="space-y-3">
            {stats?.topVendors?.slice(0, 5).map((vendor: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold">{vendor.name || `Vendor ${index + 1}`}</p>
                  <p className="text-sm text-gray-600">{vendor.bookings || 0} bookings</p>
                </div>
                <p className="font-bold text-blue-600">
                  GHS {(vendor.revenue || 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings by Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">Bookings by Status</h3>
          <div className="space-y-3">
            {[
              { status: 'Completed', count: 45, color: 'bg-green-500' },
              { status: 'Pending', count: 12, color: 'bg-yellow-500' },
              { status: 'Cancelled', count: 5, color: 'bg-red-500' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`${item.color} h-3 flex-1 rounded`}></div>
                <span className="text-sm font-medium w-24">{item.status}</span>
                <span className="text-sm font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { event: 'New booking created', time: '5 minutes ago' },
              { event: 'Payment verified', time: '12 minutes ago' },
              { event: 'Dispute created', time: '1 hour ago' },
              { event: 'User verified', time: '2 hours ago' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50">
                <p className="text-sm text-gray-700">{item.event}</p>
                <p className="text-xs text-gray-500">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
