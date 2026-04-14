'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { disputesApi } from '@/lib/api';
import { AlertTriangle, Send } from 'lucide-react';

interface DisputeFormProps {
  bookingId: number;
  otherPartyName: string;
  onSubmitSuccess?: () => void;
}

export function DisputeForm({
  bookingId,
  otherPartyName,
  onSubmitSuccess,
}: DisputeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');

      await disputesApi.create({
        bookingId,
        title: data.title,
        description: data.description,
        evidenceUrl: data.evidenceUrl,
      });

      setSuccess('Dispute filed successfully. Our team will review shortly.');
      reset();

      setTimeout(() => {
        setSuccess('');
        onSubmitSuccess?.();
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to file dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
        <AlertTriangle className="text-yellow-600" />
        File a Dispute
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Describe any issue with your booking for {otherPartyName}
      </p>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Dispute Title</label>
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            placeholder="Brief description of the issue"
            maxLength={100}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Details</label>
          <textarea
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 20, message: 'Minimum 20 characters' },
            })}
            placeholder="Provide detailed information about the issue..."
            rows={4}
            maxLength={1000}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Evidence URL (optional)</label>
          <input
            type="url"
            {...register('evidenceUrl')}
            placeholder="Link to photo or video evidence"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-600 text-white py-2 rounded-lg font-semibold hover:bg-yellow-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          <Send size={18} />
          {loading ? 'Filing Dispute...' : 'File Dispute'}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-4">
        Disputes are handled by our admin team. You will receive updates via email and notifications.
      </p>
    </div>
  );
}

// Dispute List Component
interface DisputeListProps {
  onlyMyDisputes?: boolean;
}

export function DisputeList({ onlyMyDisputes = true }: DisputeListProps) {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-3">
      {disputes.length === 0 ? (
        <div className="text-center text-gray-500 py-6 bg-gray-50 rounded">
          {loading ? 'Loading disputes...' : 'No disputes found'}
        </div>
      ) : (
        disputes.map((dispute) => (
          <div key={dispute.id} className="border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{dispute.title}</h4>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(dispute.status)}`}>
                {dispute.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{dispute.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <p>Booking #{dispute.bookingId}</p>
              <p>{new Date(dispute.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
