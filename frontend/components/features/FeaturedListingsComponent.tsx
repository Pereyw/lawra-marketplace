'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { featuredListingsApi } from '@/lib/api';
import { Star, TrendingUp, Calendar } from 'lucide-react';

interface FeaturedListingsProps {
  listingId: number;
  listingType: 'property' | 'artisan' | 'service';
  currentlyFeatured?: boolean;
  expiresAt?: string;
}

export function FeaturedListingsComponent({
  listingId,
  listingType,
  currentlyFeatured,
  expiresAt,
}: FeaturedListingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const durationOptions = [
    { value: '7', label: '7 days - GHS 50' },
    { value: '30', label: '30 days - GHS 150' },
    { value: '90', label: '90 days - GHS 350' },
    { value: '180', label: '6 months - GHS 600' },
  ];

  const getPriceForDuration = (days: string): number => {
    const prices: Record<string, number> = {
      '7': 50,
      '30': 150,
      '90': 350,
      '180': 600,
    };
    return prices[days] || 0;
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');

      if (currentlyFeatured && data.action === 'extend') {
        await featuredListingsApi.extend(listingId, {
          additionalDays: parseInt(data.duration),
        });
      } else {
        await featuredListingsApi.create(listingType, listingId, {
          durationDays: parseInt(data.duration),
          paymentMethod: 'card',
        });
      }

      setSuccess(
        `Listing ${data.action === 'extend' ? 'extended' : 'featured'} successfully!`
      );

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setLoading(true);
      await featuredListingsApi.deactivate(listingId);
      setSuccess('Featured listing deactivated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deactivate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-blue-600" size={24} />
          <h3 className="text-xl font-bold">Boost Your Listing</h3>
        </div>
        {currentlyFeatured && (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            ✓ Featured
          </span>
        )}
      </div>

      {currentlyFeatured && expiresAt && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded">
          <p className="text-sm text-blue-800">
            <Calendar size={14} className="inline mr-1" />
            Featured until: {new Date(expiresAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded border">
          <p className="text-xs text-gray-600">Current Views</p>
          <p className="text-2xl font-bold">1,234</p>
        </div>
        <div className="bg-white p-3 rounded border">
          <p className="text-xs text-gray-600">Click Through Rate</p>
          <p className="text-2xl font-bold">4.2%</p>
        </div>
      </div>

      {!currentlyFeatured ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Duration</label>
            <select
              {...register('duration', { required: 'Duration is required' })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a duration...</option>
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.duration && (
              <p className="text-red-500 text-sm">{errors.duration.message?.toString()}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select
              {...register('paymentMethod', { required: true })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="card">Credit/Debit Card</option>
              <option value="mtn_money">MTN Mobile Money</option>
              <option value="airtel_money">Airtel Money</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Feature My Listing'}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <input type="hidden" {...register('action')} value="extend" />
            <div>
              <label className="block text-sm font-medium mb-2">
                Extend Featured Period
              </label>
              <select
                {...register('duration')}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Add more days...</option>
                <option value="7">7 more days (GHS 50)</option>
                <option value="30">30 more days (GHS 150)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Extend Featured'}
            </button>
          </form>

          <button
            onClick={handleDeactivate}
            disabled={loading}
            className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-semibold hover:bg-red-200 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Stop Featuring'}
          </button>
        </div>
      )}

      {/* Benefits */}
      <div className="mt-6 pt-4 border-t">
        <p className="text-sm font-semibold text-gray-700 mb-2">Benefits:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-center gap-2">
            <Star size={12} className="text-yellow-500" fill="currentColor" />
            Appears at top of search results
          </li>
          <li className="flex items-center gap-2">
            <Star size={12} className="text-yellow-500" fill="currentColor" />
            Special badge on your profile
          </li>
          <li className="flex items-center gap-2">
            <Star size={12} className="text-yellow-500" fill="currentColor" />
            Up to 5x more visibility
          </li>
        </ul>
      </div>
    </div>
  );
}
