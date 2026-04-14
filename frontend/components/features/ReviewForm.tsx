'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { reviewsApi } from '@/lib/api';
import { Star, Send } from 'lucide-react';

interface ReviewFormProps {
  revieweeId: number;
  bookingId: number;
  onSubmitSuccess?: () => void;
}

export function ReviewForm({ revieweeId, bookingId, onSubmitSuccess }: ReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rating, setRating] = useState(0);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');

      await reviewsApi.create({
        revieweeId,
        bookingId,
        rating,
        title: data.title,
        comment: data.comment,
      });

      setSuccess('Review submitted successfully!');
      reset();
      setRating(0);
      
      setTimeout(() => {
        setSuccess('');
        onSubmitSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Leave a Review</h3>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1 transition ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                <Star size={32} fill="currentColor" />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-1">{rating} out of 5 stars</p>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Review Title</label>
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            placeholder="Summarize your experience"
            maxLength={100}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium mb-2">Your Review</label>
          <textarea
            {...register('comment', { required: 'Review comment is required', minLength: { value: 10, message: 'Minimum 10 characters' } })}
            placeholder="Share your detailed experience..."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.comment && <p className="text-red-500 text-sm">{errors.comment.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          <Send size={18} />
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

// Review Display Component
interface ReviewDisplayProps {
  reviews: any[];
  isLoading?: boolean;
}

export function ReviewDisplay({ reviews, isLoading }: ReviewDisplayProps) {
  if (isLoading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return <div className="text-center text-gray-500 py-4">No reviews yet</div>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold">{review.reviewer?.name || 'Anonymous'}</p>
              <p className="text-sm text-gray-600">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex">
              {Array(5).fill(0).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                  fill="currentColor"
                />
              ))}
            </div>
          </div>
          <p className="font-medium mb-2">{review.title}</p>
          <p className="text-gray-700">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
