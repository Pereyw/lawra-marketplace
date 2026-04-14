/**
 * Payment Controller
 * Handles payments and escrow operations
 */

class PaymentController {
  constructor(paymentModel, escrowModel, bookingModel, notificationModel) {
    this.paymentModel = paymentModel;
    this.escrowModel = escrowModel;
    this.bookingModel = bookingModel;
    this.notificationModel = notificationModel;
  }

  /**
   * Create payment with escrow
   * POST /api/payments/create
   */
  async createPayment(req, res) {
    try {
      const { bookingId, amount, method, mobileMoneyProvider = null } = req.body;
      const userId = req.user.id;

      // Validate inputs
      if (!bookingId || !amount || !method) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const validMethods = ['credit_card', 'debit_card', 'mobile_money', 'bank_transfer'];
      if (!validMethods.includes(method)) {
        return res.status(400).json({ error: 'Invalid payment method' });
      }

      if (method === 'mobile_money' && !mobileMoneyProvider) {
        return res.status(400).json({ error: 'Mobile money provider required' });
      }

      // Verify booking exists
      const booking = await this.bookingModel.getBooking(bookingId);
      if (!booking || booking.user_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to pay for this booking' });
      }

      // Create payment
      const payment = await this.paymentModel.createPayment(
        bookingId,
        userId,
        amount,
        method,
        mobileMoneyProvider
      );

      // Create escrow for the payment
      const escrow = await this.escrowModel.createEscrow(
        payment.id,
        bookingId,
        amount,
        'booking_completion'
      );

      // Send notification
      await this.notificationModel.createPaymentNotification(userId, payment.id, 'pending');

      res.status(201).json({
        message: 'Payment initiated',
        payment,
        escrow
      });
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({ error: error.message || 'Failed to create payment' });
    }
  }

  /**
   * Verify payment (mock Mobile Money)
   * POST /api/payments/:id/verify
   */
  async verifyPayment(req, res) {
    try {
      const { id } = req.params;
      const { transactionRef } = req.body;

      if (!transactionRef) {
        return res.status(400).json({ error: 'Transaction reference required' });
      }

      const payment = await this.paymentModel.getPayment(id);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      // Simulate payment verification
      // In production, verify with payment provider
      const verified = await this.paymentModel.updatePaymentStatus(id, 'completed', transactionRef);

      // Release escrow if payment is completed
      const escrow = await this.escrowModel.getEscrowByPaymentId(id);
      if (escrow && escrow.status === 'held') {
        await this.escrowModel.releaseEscrow(escrow.id);
      }

      // Send notifications
      await this.notificationModel.createPaymentNotification(payment.user_id, id, 'completed');

      res.status(200).json({
        message: 'Payment verified successfully',
        payment: verified
      });
    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({ error: 'Failed to verify payment' });
    }
  }

  /**
   * Get user's payments
   * GET /api/payments/my-payments
   */
  async getMyPayments(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10, offset = 0 } = req.query;

      const payments = await this.paymentModel.getPaymentsByUser(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      res.status(200).json({ payments });
    } catch (error) {
      console.error('Get my payments error:', error);
      res.status(500).json({ error: 'Failed to get payments' });
    }
  }

  /**
   * Get payment details
   * GET /api/payments/:id
   */
  async getPaymentDetails(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const payment = await this.paymentModel.getPayment(id);
      if (!payment || payment.user_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to view this payment' });
      }

      // Get associated escrow
      const escrow = await this.escrowModel.getEscrowByPaymentId(id);

      res.status(200).json({
        payment,
        escrow
      });
    } catch (error) {
      console.error('Get payment details error:', error);
      res.status(500).json({ error: 'Failed to get payment details' });
    }
  }

  /**
   * Refund payment
   * POST /api/payments/:id/refund
   */
  async refundPayment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const payment = await this.paymentModel.getPayment(id);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (payment.status !== 'completed') {
        return res.status(400).json({ error: 'Only completed payments can be refunded' });
      }

      // Update payment status
      const refunded = await this.paymentModel.updatePaymentStatus(id, 'refunded');

      // Refund escrow
      const escrow = await this.escrowModel.getEscrowByPaymentId(id);
      if (escrow && escrow.status === 'released') {
        await this.escrowModel.refundEscrow(escrow.id, reason);
      }

      // Send notification
      await this.notificationModel.createPaymentNotification(payment.user_id, id, 'refunded');

      res.status(200).json({
        message: 'Payment refunded successfully',
        payment: refunded
      });
    } catch (error) {
      console.error('Refund payment error:', error);
      res.status(500).json({ error: 'Failed to refund payment' });
    }
  }

  /**
   * Get escrow details
   * GET /api/escrow/:paymentId
   */
  async getEscrowDetails(req, res) {
    try {
      const { paymentId } = req.params;

      const escrow = await this.escrowModel.getEscrowByPaymentId(paymentId);
      if (!escrow) {
        return res.status(404).json({ error: 'Escrow not found' });
      }

      res.status(200).json({ escrow });
    } catch (error) {
      console.error('Get escrow details error:', error);
      res.status(500).json({ error: 'Failed to get escrow details' });
    }
  }

  /**
   * Release escrow (Admin or triggerable by booking completion)
   * POST /api/escrow/:id/release
   */
  async releaseEscrow(req, res) {
    try {
      const { id } = req.params;

      const escrow = await this.escrowModel.releaseEscrow(id);

      res.status(200).json({
        message: 'Escrow released successfully',
        escrow
      });
    } catch (error) {
      console.error('Release escrow error:', error);
      res.status(500).json({ error: 'Failed to release escrow' });
    }
  }

  /**
   * Refund escrow (for disputes/cancellations)
   * POST /api/escrow/:id/refund
   */
  async refundEscrow(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const escrow = await this.escrowModel.refundEscrow(id, reason);

      res.status(200).json({
        message: 'Escrow refunded successfully',
        escrow
      });
    } catch (error) {
      console.error('Refund escrow error:', error);
      res.status(500).json({ error: 'Failed to refund escrow' });
    }
  }

  /**
   * Get held escrow for analytics
   * GET /api/admin/escrow/held
   */
  async getHeldEscrow(req, res) {
    try {
      const data = await this.escrowModel.getHeldEscrow();

      res.status(200).json({
        heldEscrow: {
          totalAmount: data.total_held || 0,
          count: data.count || 0
        }
      });
    } catch (error) {
      console.error('Get held escrow error:', error);
      res.status(500).json({ error: 'Failed to get held escrow' });
    }
  }

  /**
   * Mark escrow as disputed
   * POST /api/escrow/:id/dispute
   */
  async markEscrowAsDisputed(req, res) {
    try {
      const { id } = req.params;

      const escrow = await this.escrowModel.markDisputeEscrow(id);

      res.status(200).json({
        message: 'Escrow marked as disputed',
        escrow
      });
    } catch (error) {
      console.error('Mark escrow as disputed error:', error);
      res.status(500).json({ error: 'Failed to mark escrow as disputed' });
    }
  }
}

module.exports = PaymentController;
