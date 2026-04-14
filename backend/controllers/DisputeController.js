/**
 * Dispute Controller
 * Handles dispute resolution
 */

class DisputeController {
  constructor(disputeModel, bookingModel, notificationModel) {
    this.disputeModel = disputeModel;
    this.bookingModel = bookingModel;
    this.notificationModel = notificationModel;
  }

  /**
   * Create a dispute
   * POST /api/disputes
   */
  async createDispute(req, res) {
    try {
      const { bookingId, respondentId, subject, description } = req.body;
      const complainantId = req.user.id;

      // Validate inputs
      if (!bookingId || !respondentId || !subject || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify booking exists and involves complaint
      const booking = await this.bookingModel.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Create dispute
      const dispute = await this.disputeModel.createDispute(
        bookingId,
        complainantId,
        respondentId,
        subject,
        description
      );

      // Notify respondent
      await this.notificationModel.createNotification(
        respondentId,
        'dispute',
        'New Dispute Filed',
        `A dispute has been filed against you. Subject: ${subject}`,
        { disputeId: dispute.id, bookingId }
      );

      // Notify admin
      await this.notificationModel.createNotification(
        1, // Assuming admin ID 1
        'dispute_alert',
        'New Dispute Reported',
        `A new dispute has been filed. Subject: ${subject}`,
        { disputeId: dispute.id, bookingId }
      );

      res.status(201).json({
        message: 'Dispute created successfully',
        dispute
      });
    } catch (error) {
      console.error('Create dispute error:', error);
      res.status(500).json({ error: error.message || 'Failed to create dispute' });
    }
  }

  /**
   * Get all disputes (Admin only)
   * GET /api/admin/disputes
   */
  async getAllDisputes(req, res) {
    try {
      const { status, limit = 20, offset = 0 } = req.query;

      const disputes = await this.disputeModel.getAllDisputes(
        status || null,
        parseInt(limit),
        parseInt(offset)
      );

      const count = await this.disputeModel.getOpenDisputesCount();

      res.status(200).json({
        disputes,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: count
        }
      });
    } catch (error) {
      console.error('Get disputes error:', error);
      res.status(500).json({ error: 'Failed to get disputes' });
    }
  }

  /**
   * Get user's disputes
   * GET /api/disputes/my-disputes
   */
  async getUserDisputes(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10, offset = 0 } = req.query;

      const disputes = await this.disputeModel.getDisputesForUser(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      res.status(200).json({ disputes });
    } catch (error) {
      console.error('Get user disputes error:', error);
      res.status(500).json({ error: 'Failed to get disputes' });
    }
  }

  /**
   * Get dispute details
   * GET /api/disputes/:id
   */
  async getDisputeDetails(req, res) {
    try {
      const { id } = req.params;

      const dispute = await this.disputeModel.getDisputeById(id);

      if (!dispute) {
        return res.status(404).json({ error: 'Dispute not found' });
      }

      res.status(200).json({ dispute });
    } catch (error) {
      console.error('Get dispute details error:', error);
      res.status(500).json({ error: 'Failed to get dispute' });
    }
  }

  /**
   * Update dispute status (Admin only)
   * PUT /api/admin/disputes/:id/status
   */
  async updateDisputeStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, resolution } = req.body;
      const adminId = req.user.id;

      const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const dispute = await this.disputeModel.updateDisputeStatus(
        id,
        status,
        resolution,
        adminId
      );

      // Notify both parties
      await this.notificationModel.createNotification(
        dispute.complainant_id,
        'dispute_update',
        'Dispute Status Updated',
        `Your dispute status has been updated to: ${status}`,
        { disputeId: id, status, resolution }
      );

      await this.notificationModel.createNotification(
        dispute.respondent_id,
        'dispute_update',
        'Dispute Status Updated',
        `A dispute status has been updated to: ${status}`,
        { disputeId: id, status, resolution }
      );

      res.status(200).json({
        message: 'Dispute status updated',
        dispute
      });
    } catch (error) {
      console.error('Update dispute status error:', error);
      res.status(500).json({ error: 'Failed to update dispute' });
    }
  }

  /**
   * Resolve dispute (Admin only)
   * POST /api/admin/disputes/:id/resolve
   */
  async resolveDispute(req, res) {
    try {
      const { id } = req.params;
      const { resolution } = req.body;
      const adminId = req.user.id;

      if (!resolution) {
        return res.status(400).json({ error: 'Resolution is required' });
      }

      const dispute = await this.disputeModel.resolveDispute(id, resolution, adminId);

      res.status(200).json({
        message: 'Dispute resolved',
        dispute
      });
    } catch (error) {
      console.error('Resolve dispute error:', error);
      res.status(500).json({ error: 'Failed to resolve dispute' });
    }
  }

  /**
   * Close dispute (Admin only)
   * POST /api/admin/disputes/:id/close
   */
  async closeDispute(req, res) {
    try {
      const { id } = req.params;

      const dispute = await this.disputeModel.closeDispute(id);

      res.status(200).json({
        message: 'Dispute closed',
        dispute
      });
    } catch (error) {
      console.error('Close dispute error:', error);
      res.status(500).json({ error: 'Failed to close dispute' });
    }
  }
}

module.exports = DisputeController;
