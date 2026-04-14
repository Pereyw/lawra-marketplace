'use client';

import { useState, useEffect } from 'react';
import { verificationsApi } from '@/lib/api';
import { CheckCircle2, XCircle, Clock, Download, Eye } from 'lucide-react';

export function VerificationDashboard() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<any>(null);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const response = await verificationsApi.getStatus();
      // In real app, would fetch from /admin/verifications/pending
      setVerifications([]);
    } catch (err: any) {
      setError('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId: number) => {
    try {
      // await verificationsApi.approve(verificationId, { notes: 'Approved' });
      console.log('Approve:', verificationId);
      setVerifications(prev =>
        prev.map(v => v.id === verificationId ? { ...v, status: 'approved' } : v)
      );
    } catch (err) {
      setError('Failed to approve verification');
    }
  };

  const handleReject = async (verificationId: number) => {
    try {
      // await verificationsApi.reject(verificationId, { notes: 'Document unclear' });
      console.log('Reject:', verificationId);
      setVerifications(prev =>
        prev.map(v => v.id === verificationId ? { ...v, status: 'rejected' } : v)
      );
    } catch (err) {
      setError('Failed to reject verification');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="text-green-600" size={24} />;
      case 'rejected':
        return <XCircle className="text-red-600" size={24} />;
      case 'pending':
        return <Clock className="text-yellow-600" size={24} />;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading verifications...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-bold text-lg">Pending Verifications</h3>
          <p className="text-sm text-gray-600">{verifications.length} pending</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 m-4 rounded">
            {error}
          </div>
        )}

        <div className="divide-y max-h-96 overflow-y-auto">
          {verifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No pending verifications
            </div>
          ) : (
            verifications.map((verification) => (
              <div
                key={verification.id}
                onClick={() => setSelectedVerification(verification)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                  selectedVerification?.id === verification.id
                    ? 'bg-blue-50 border-l-4 border-blue-600'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{verification.userName}</p>
                    <p className="text-xs text-gray-600">{verification.idType}</p>
                  </div>
                  {getStatusIcon(verification.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Details */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
        {selectedVerification ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Verification Details</h3>
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedVerification.status)}
                <span className="text-sm font-semibold capitalize">
                  {selectedVerification.status}
                </span>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">User</p>
                  <p className="font-semibold">{selectedVerification.userName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-semibold">{selectedVerification.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">ID Type</p>
                  <p className="font-semibold capitalize">{selectedVerification.idType}</p>
                </div>
                <div>
                  <p className="text-gray-600">ID Number</p>
                  <p className="font-semibold">{selectedVerification.idNumber}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Submitted</p>
                  <p className="font-semibold">
                    {new Date(selectedVerification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Preview */}
            <div className="border rounded-lg p-4">
              <p className="font-semibold mb-3 flex items-center gap-2">
                <Eye size={18} />
                Document
              </p>
              <div className="bg-gray-100 h-48 rounded flex items-center justify-center mb-3">
                <img
                  src={selectedVerification.documentUrl || '/placeholder.png'}
                  alt="ID Document"
                  className="max-h-44 max-w-full"
                />
              </div>
              <a
                href={selectedVerification.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Download size={16} />
                Download Document
              </a>
            </div>

            {/* Actions */}
            {selectedVerification.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleApprove(selectedVerification.id)}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedVerification.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  Reject
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Eye size={48} className="mx-auto mb-4 opacity-25" />
              <p>Select a verification to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
