'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { paymentsApi } from '@/lib/api';
import { mockPaymentProvider, PaymentHelper, PaymentMethod } from '@/lib/payment-mock';
import { CreditCard, Loader } from 'lucide-react';

interface PaymentFormProps {
  bookingId: number;
  amount: number;
  description: string;
  onPaymentSuccess?: (transactionId: string) => void;
}

export function PaymentForm({
  bookingId,
  amount,
  description,
  onPaymentSuccess,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [useEscrow, setUseEscrow] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mtn_money');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'mtn_money', label: 'MTN Mobile Money' },
    { value: 'airtel_money', label: 'Airtel Money' },
    { value: 'vodafone_cash', label: 'Vodafone Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
  ];

  const fee = PaymentHelper.calculateFees(amount, selectedMethod);
  const totalAmount = amount + fee;

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');

      // First step: Create payment in our system
      const paymentResponse = await paymentsApi.create({
        bookingId,
        amount,
        paymentMethod: selectedMethod,
        useEscrow,
        description,
      });

      const paymentId = paymentResponse.data.data.paymentId;

      // Second step: Process payment with mock provider
      const mockRequest = {
        amount: totalAmount,
        currency: 'GHS',
        description,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        paymentMethod: selectedMethod,
        externalId: `BOOKING_${bookingId}`,
        callbackUrl: `${window.location.origin}/payment-callback`,
      };

      const validationErrors = PaymentHelper.validatePaymentRequest(mockRequest);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }

      const mockResponse = await mockPaymentProvider.initiatePayment(mockRequest);

      // Third step: Verify payment with our backend
      const verifyResponse = await paymentsApi.verify(paymentId, {
        transactionId: mockResponse.transactionId,
        status: mockResponse.status,
        amount: mockResponse.amount,
      });

      if (verifyResponse.data.data.verified) {
        setSuccess(`Payment successful! Transaction: ${mockResponse.transactionId}`);
        onPaymentSuccess?.(mockResponse.transactionId);

        setTimeout(() => setSuccess(''), 5000);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CreditCard />
        Payment & Escrow
      </h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded mb-4">
          {success}
        </div>
      )}

      {/* Payment Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Amount</p>
            <p className="font-bold text-lg">{PaymentHelper.formatAmount(amount)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Processing Fee</p>
            <p className="font-bold text-lg text-blue-600">+{PaymentHelper.formatAmount(fee)}</p>
          </div>
          <div className="col-span-2 border-t pt-2">
            <p className="text-gray-600 text-sm">Total Amount</p>
            <p className="font-bold text-xl">{PaymentHelper.formatAmount(totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Escrow Checkbox */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={useEscrow}
            onChange={(e) => setUseEscrow(e.target.checked)}
            className="w-4 h-4"
          />
          <div>
            <p className="font-semibold">Use Secure Escrow</p>
            <p className="text-sm text-gray-600">
              Funds are held securely until service is completed
            </p>
          </div>
        </label>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium mb-2">Payment Method</label>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              {...register('customerName', { required: 'Name is required' })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm">{errors.customerName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              {...register('customerPhone', {
                required: 'Phone is required',
                pattern: {
                  value: /^[0-9\-\+]{10,}$/,
                  message: 'Invalid phone number',
                },
              })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.customerPhone && (
              <p className="text-red-500 text-sm">{errors.customerPhone.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            {...register('customerEmail', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.customerEmail && (
            <p className="text-red-500 text-sm">{errors.customerEmail.message}</p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">ℹ️ Note:</span> This is a mock payment provider for testing.
            In production, real payment gateway credentials will be used.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader size={18} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={18} />
              Pay {PaymentHelper.formatAmount(totalAmount)}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
