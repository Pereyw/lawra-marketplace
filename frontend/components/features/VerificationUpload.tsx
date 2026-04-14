'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { verificationsApi } from '@/lib/api';
import { Upload, CheckCircle, Clock, XCircle } from 'lucide-react';

type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'not_submitted';

export function VerificationUpload() {
  const [status, setStatus] = useState<VerificationStatus>('not_submitted');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Check current verification status
  const checkStatus = async () => {
    try {
      const response = await verificationsApi.getStatus();
      setStatus(response.data.data.status);
    } catch (err: any) {
      setStatus('not_submitted');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('idType', data.idType);
      formData.append('idNumber', data.idNumber);
      if (data.document && data.document[0]) {
        formData.append('document', data.document[0]);
      }

      const response = await verificationsApi.submit(formData);
      setSuccess('Verification submitted successfully!');
      setStatus('pending');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-600" />;
      case 'pending':
        return <Clock className="text-yellow-600" />;
      case 'rejected':
        return <XCircle className="text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">KYC Verification</h2>

      {/* Status Display */}
      {status !== 'not_submitted' && (
        <div className={`p-4 mb-6 border rounded-lg ${getStatusColor()} flex items-center gap-3`}>
          {getStatusIcon()}
          <div>
            <p className="font-semibold capitalize">{status}</p>
            {status === 'pending' && <p className="text-sm">Your verification is being reviewed</p>}
            {status === 'rejected' && <p className="text-sm">Please contact support for details</p>}
            {status === 'approved' && <p className="text-sm">Your identity has been verified</p>}
          </div>
        </div>
      )}

      {status === 'approved' && (
        <div className="bg-green-100 border border-green-400 text-green-800 p-4 rounded-lg mb-6 text-center font-semibold">
          ✓ You are verified! Your profile badge is active.
        </div>
      )}

      {status === 'not_submitted' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">ID Type</label>
            <select
              {...register('idType', { required: 'ID type is required' })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select ID Type</option>
              <option value="ghana_card">Ghana Card</option>
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver's License</option>
            </select>
            {errors.idType && <p className="text-red-500 text-sm">{errors.idType.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ID Number</label>
            <input
              type="text"
              {...register('idNumber', { required: 'ID number is required' })}
              placeholder="Enter your ID number"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.idNumber && <p className="text-red-500 text-sm">{errors.idNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Upload Document</label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50">
              <Upload className="mx-auto mb-2 text-gray-400" />
              <input
                type="file"
                {...register('document', { required: 'Document is required' })}
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">PDF, JPG, PNG up to 5MB</p>
            </div>
            {errors.document && <p className="text-red-500 text-sm">{errors.document.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </form>
      )}

      {status !== 'not_submitted' && status !== 'approved' && (
        <button
          onClick={checkStatus}
          className="w-full bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700"
        >
          Check Status
        </button>
      )}
    </div>
  );
}
