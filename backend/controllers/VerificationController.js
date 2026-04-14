/**
 * Verification Controller
 * Handles KYC verification requests
 */

class VerificationController {
  constructor(verificationModel, notificationModel) {
    this.verificationModel = verificationModel;
    this.notificationModel = notificationModel;
  }

  /**
   * Submit verification request
   * POST /api/verifications/submit
   */
  async submitVerification(req, res) {
    try {
      const { userId, idType, idNumber, documentUrl } = req.body;

      // Validate inputs
      if (!userId || !idType || !idNumber || !documentUrl) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const validIdTypes = ['ghana_card', 'passport', 'drivers_license'];
      if (!validIdTypes.includes(idType)) {
        return res.status(400).json({ error: 'Invalid ID type' });
      }

      // Check for existing verification
      const existing = await this.verificationModel.getVerificationByUserId(userId);
      
      if (existing) {
        if (existing.status === 'pending') {
          return res.status(400).json({ error: 'Verification already pending' });
        }
        if (existing.status === 'approved') {
          return res.status(400).json({ error: 'User already verified' });
        }
        // If rejected, allow re-submission
        const updated = await this.verificationModel.updateVerification(
          existing.id,
          idType,
          idNumber,
          documentUrl
        );
        return res.status(200).json({ 
          message: 'Verification re-submitted for review',
          verification: updated 
        });
      }

      // Create new verification
      const verification = await this.verificationModel.createVerification(
        userId,
        idType,
        idNumber,
        documentUrl
      );

      res.status(201).json({
        message: 'Verification submitted successfully',
        verification
      });
    } catch (error) {
      console.error('Verification submission error:', error);
      res.status(500).json({ error: 'Failed to submit verification' });
    }
  }

  /**
   * Get pending verifications (Admin only)
   * GET /api/admin/verifications/pending
   */
  async getPendingVerifications(req, res) {
    try {
      const { limit = 20, offset = 0 } = req.query;

      const verifications = await this.verificationModel.getPendingVerifications(
        parseInt(limit),
        parseInt(offset)
      );

      const count = await this.verificationModel.countPendingVerifications();

      res.status(200).json({
        verifications,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: count
        }
      });
    } catch (error) {
      console.error('Get pending verifications error:', error);
      res.status(500).json({ error: 'Failed to get pending verifications' });
    }
  }

  /**
   * Approve verification (Admin only)
   * POST /api/admin/verifications/:id/approve
   */
  async approveVerification(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id; // From auth middleware

      const verification = await this.verificationModel.approveVerification(id, adminId);

      // Send notification to user
      await this.notificationModel.createNotification(
        verification.user_id,
        'verification',
        'Identity Verified',
        'Your identity has been verified successfully!',
        { status: 'approved' }
      );

      res.status(200).json({
        message: 'Verification approved',
        verification
      });
    } catch (error) {
      console.error('Approve verification error:', error);
      res.status(500).json({ error: 'Failed to approve verification' });
    }
  }

  /**
   * Reject verification (Admin only)
   * POST /api/admin/verifications/:id/reject
   */
  async rejectVerification(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      if (!reason) {
        return res.status(400).json({ error: 'Rejection reason required' });
      }

      const result = await this.verificationModel.rejectVerification(id, adminId, reason);
      const verification = result.rows[0];

      // Send notification to user
      await this.notificationModel.createNotification(
        verification.user_id,
        'verification',
        'Verification Rejected',
        `Your identity verification was rejected. Reason: ${reason}`,
        { status: 'rejected', reason }
      );

      res.status(200).json({
        message: 'Verification rejected',
        verification
      });
    } catch (error) {
      console.error('Reject verification error:', error);
      res.status(500).json({ error: 'Failed to reject verification' });
    }
  }

  /**
   * Get user's verification status
   * GET /api/verifications/status
   */
  async getVerificationStatus(req, res) {
    try {
      const userId = req.user.id;

      const status = await this.verificationModel.getVerificationStatus(userId);

      res.status(200).json({ status: status || 'not_submitted' });
    } catch (error) {
      console.error('Get verification status error:', error);
      res.status(500).json({ error: 'Failed to get verification status' });
    }
  }

  /**
   * Get user's verification details
   * GET /api/verifications/details
   */
  async getVerificationDetails(req, res) {
    try {
      const userId = req.user.id;

      const verification = await this.verificationModel.getVerificationByUserId(userId);

      if (!verification) {
        return res.status(404).json({ error: 'No verification found' });
      }

      // Don't return sensitive info
      const safe = {
        id: verification.id,
        status: verification.status,
        id_type: verification.id_type,
        verified_at: verification.verified_at,
        rejection_reason: verification.rejection_reason,
        created_at: verification.created_at
      };

      res.status(200).json(safe);
    } catch (error) {
      console.error('Get verification details error:', error);
      res.status(500).json({ error: 'Failed to get verification details' });
    }
  }
}

module.exports = VerificationController;
