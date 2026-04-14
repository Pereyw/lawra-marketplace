'use client';

import { useState } from 'react';
import { disputesApi } from '@/lib/api';
import { AlertTriangle, CheckCircle2, Clock, MessageSquare } from 'lucide-react';

export function DisputeManagement() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="text-red-600" size={20} />;
      case 'under_review':
        return <Clock className="text-yellow-600" size={20} />;
      case 'resolved':
        return <CheckCircle2 className="text-green-600" size={20} />;
      default:
        return <MessageSquare className="text-blue-600" size={20} />;
    }
  };

  const handleResolve = async (decision: 'refund_customer' | 'uphold' | 'partial') => {
    if (!selectedDispute || !resolutionText.trim()) {
      setError('Please provide resolution details');
      return;
    }

    try {
      setLoading(true);
      await disputesApi.resolve(selectedDispute.id, {
        decision,
        resolution: resolutionText,
        compensation: selectedDispute.bookingAmount * 0.5, // 50% refund example
      });

      setDisputes(prev =>
        prev.map(d =>
          d.id === selectedDispute.id
            ? { ...d, status: 'resolved' }
            : d
        )
      );
      setResolutionText('');
      setError('');
    } catch (err: any) {
      setError('Failed to resolve dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Disputes List */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-bold text-lg">Disputes</h3>
          <p className="text-sm text-gray-600">{disputes.length} total</p>
        </div>

        <div className="divide-y max-h-96 overflow-y-auto">
          {disputes.map((dispute) => (
            <div
              key={dispute.id}
              onClick={() => {
                setSelectedDispute(dispute);
                setError('');
              }}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition border-l-4 ${
                selectedDispute?.id === dispute.id
                  ? 'bg-blue-50 border-l-blue-600'
                  : 'border-l-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-sm">{dispute.title}</p>
                {getStatusIcon(dispute.status)}
              </div>
              <p className="text-xs text-gray-600">
                Booking #{dispute.bookingId}
              </p>
              <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${getStatusColor(dispute.status)}`}>
                {dispute.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dispute Details */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
        {selectedDispute ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold">{selectedDispute.title}</h3>
              <span className={`text-sm px-3 py-1 rounded-full font-semibold border ${getStatusColor(selectedDispute.status)}`}>
                {selectedDispute.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Dispute Info */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
              <div>
                <p className="text-gray-600 text-sm">Complainant</p>
                <p className="font-semibold">{selectedDispute.complainantName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Respondent</p>
                <p className="font-semibold">{selectedDispute.respondentName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Booking Amount</p>
                <p className="font-semibold">GHS {selectedDispute.bookingAmount}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Filed</p>
                <p className="font-semibold">
                  {new Date(selectedDispute.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="font-semibold mb-2">Description</p>
              <p className="text-gray-700 p-3 bg-gray-50 rounded">
                {selectedDispute.description}
              </p>
            </div>

            {/* Evidence */}
            {selectedDispute.evidenceUrl && (
              <div>
                <p className="font-semibold mb-2">Evidence</p>
                <img
                  src={selectedDispute.evidenceUrl}
                  alt="Evidence"
                  className="max-h-48 rounded"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded">
                {error}
              </div>
            )}

            {/* Resolution */}
            {selectedDispute.status !== 'closed' && (
              <div className="border-t pt-4">
                <p className="font-semibold mb-2">Resolution Decision</p>
                <textarea
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Enter your resolution details..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolve('refund_customer')}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 disabled:bg-gray-400"
                  >
                    Refund Customer
                  </button>
                  <button
                    onClick={() => handleResolve('uphold')}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Uphold Service
                  </button>
                  <button
                    onClick={() => handleResolve('partial')}
                    disabled={loading}
                    className="flex-1 bg-yellow-600 text-white py-2 rounded font-semibold hover:bg-yellow-700 disabled:bg-gray-400"
                  >
                    Partial Refund
                  </button>
                </div>
              </div>
            )}

            {selectedDispute.status === 'resolved' && selectedDispute.resolution && (
              <div className="bg-green-50 border border-green-300 p-4 rounded">
                <p className="font-semibold text-green-800 mb-2">Resolution</p>
                <p className="text-green-700">{selectedDispute.resolution}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <AlertTriangle size={48} className="mx-auto mb-4 opacity-25" />
              <p>Select a dispute to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
