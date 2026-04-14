/**
 * Mock Payment Provider Service
 * Simulates Mobile Money and Card payment processing
 * For testing only - replace with real provider in production
 */

export type PaymentMethod = 'mtn_money' | 'airtel_money' | 'vodafone_cash' | 'credit_card' | 'debit_card';
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';

export interface MockPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  externalId: string;
  callbackUrl: string;
}

export interface MockPaymentResponse {
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  timestamp: string;
  message?: string;
  redirectUrl?: string;
}

export interface MockTransactionStatus {
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  paidAt?: string;
  metadata?: any;
}

class MockPaymentProvider {
  private transactions: Map<string, MockTransactionStatus> = new Map();
  private failureRate = 0.05; // 5% failure rate for testing

  /**
   * Initialize a payment request
   */
  async initiatePayment(request: MockPaymentRequest): Promise<MockPaymentResponse> {
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate random failures (5% chance)
    if (Math.random() < this.failureRate) {
      this.transactions.set(transactionId, {
        transactionId,
        status: 'failed',
        amount: request.amount,
      });

      return {
        transactionId,
        status: 'failed',
        amount: request.amount,
        currency: request.currency,
        timestamp: new Date().toISOString(),
        message: 'Payment processing failed. Please try again.',
      };
    }

    // For mobile money, return a redirect URL for USSD/app
    if (['mtn_money', 'airtel_money', 'vodafone_cash'].includes(request.paymentMethod)) {
      this.transactions.set(transactionId, {
        transactionId,
        status: 'processing',
        amount: request.amount,
      });

      return {
        transactionId,
        status: 'processing',
        amount: request.amount,
        currency: request.currency,
        timestamp: new Date().toISOString(),
        message: 'Please complete payment on your phone',
        redirectUrl: `https://mock-payment-provider.local/ussd/${transactionId}`,
      };
    }

    // For cards, simulate immediate processing
    this.transactions.set(transactionId, {
      transactionId,
      status: 'success',
      amount: request.amount,
      paidAt: new Date().toISOString(),
    });

    return {
      transactionId,
      status: 'success',
      amount: request.amount,
      currency: request.currency,
      timestamp: new Date().toISOString(),
      message: 'Payment successful',
    };
  }

  /**
   * Query transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<MockTransactionStatus | null> {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      return null;
    }

    // Simulate processing delay - move pending to processing after ~2 seconds
    if (transaction.status === 'processing') {
      // In real app, this would check with actual payment provider
      const elapsed = Date.now() % 5000; // Simulate time passage
      if (elapsed > 2000) {
        transaction.status = 'success';
        transaction.paidAt = new Date().toISOString();
      }
    }

    return transaction;
  }

  /**
   * Verify payment (webhook callback)
   */
  async verifyPayment(transactionId: string): Promise<boolean> {
    const transaction = this.transactions.get(transactionId);
    return transaction?.status === 'success' || false;
  }

  /**
   * Refund a transaction
   */
  async refundTransaction(transactionId: string, amount?: number): Promise<{
    success: boolean;
    refundId: string;
    message: string;
  }> {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      return {
        success: false,
        refundId: '',
        message: 'Transaction not found',
      };
    }

    if (transaction.status !== 'success') {
      return {
        success: false,
        refundId: '',
        message: 'Only successful transactions can be refunded',
      };
    }

    const refundId = `RFD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      refundId,
      message: `Refund of ${amount || transaction.amount} GHS processed successfully`,
    };
  }

  /**
   * Get mock transaction history
   */
  getTransactionHistory(limit = 10): MockTransactionStatus[] {
    return Array.from(this.transactions.values()).slice(-limit);
  }

  /**
   * Clear transaction history (for testing)
   */
  clearHistory(): void {
    this.transactions.clear();
  }

  /**
   * Test payment scenarios
   */
  async testPaymentScenario(scenario: 'success' | 'failure' | 'pending'): Promise<string> {
    const request: MockPaymentRequest = {
      amount: 50.0,
      currency: 'GHS',
      description: `Test payment - ${scenario}`,
      customerName: 'Test User',
      customerPhone: '+233501234567',
      customerEmail: 'test@example.com',
      paymentMethod: 'mtn_money',
      externalId: `TEST_${Date.now()}`,
      callbackUrl: 'http://localhost:3000/payment-callback',
    };

    // Adjust for test scenario
    if (scenario === 'failure') {
      this.failureRate = 1.0; // Force failure
    } else if (scenario === 'success') {
      this.failureRate = 0; // Force success
    }

    const response = await this.initiatePayment(request);
    this.failureRate = 0.05; // Reset

    return response.transactionId;
  }
}

// Export singleton instance
export const mockPaymentProvider = new MockPaymentProvider();

// Payment helper for frontend
export const PaymentHelper = {
  // Format currency for display
  formatAmount: (amount: number, currency = 'GHS'): string => {
    return `${currency} ${amount.toFixed(2)}`;
  },

  // Get payment method display name
  getPaymentMethodLabel: (method: PaymentMethod): string => {
    const labels: Record<PaymentMethod, string> = {
      mtn_money: 'MTN Mobile Money',
      airtel_money: 'Airtel Money',
      vodafone_cash: 'Vodafone Cash',
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
    };
    return labels[method] || method;
  },

  // Calculate fees (if applicable)
  calculateFees: (amount: number, paymentMethod: PaymentMethod): number => {
    const feePercentages: Record<PaymentMethod, number> = {
      mtn_money: 0.01, // 1%
      airtel_money: 0.01,
      vodafone_cash: 0.01,
      credit_card: 0.025, // 2.5%
      debit_card: 0.015, // 1.5%
    };
    return (amount * (feePercentages[paymentMethod] || 0));
  },

  // Validate payment details
  validatePaymentRequest: (request: Partial<MockPaymentRequest>): string[] => {
    const errors: string[] = [];

    if (!request.amount || request.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }
    if (!request.customerPhone) {
      errors.push('Phone number is required');
    }
    if (!request.customerEmail) {
      errors.push('Email is required');
    }
    if (!request.paymentMethod) {
      errors.push('Payment method is required');
    }

    return errors;
  },

  // Simulate webhook callback
  simulateWebhookCallback: async (transactionId: string): Promise<boolean> => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockPaymentProvider.verifyPayment(transactionId);
  },
};

// Payment status colors for UI
export const PaymentStatusColors: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};
