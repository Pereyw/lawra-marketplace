/**
 * Advanced Features API Routes
 * Extends existing API with new functionality
 */

module.exports = (
  verificationController,
  reviewController,
  disputeController,
  paymentController,
  notificationController,
  featuredListingsController
) => {
  const express = require('express');
  const router = express.Router();
  const { verifyToken, authorizeRole, rateLimit } = require('../middleware/auth');

  // ============ VERIFICATION (KYC) ROUTES ============

  /**
   * Submit verification request (user)
   */
  router.post('/verifications/submit', verifyToken, (req, res) =>
    verificationController.submitVerification(req, res)
  );

  /**
   * Get verification status
   */
  router.get('/verifications/status', verifyToken, (req, res) =>
    verificationController.getVerificationStatus(req, res)
  );

  /**
   * Get verification details
   */
  router.get('/verifications/details', verifyToken, (req, res) =>
    verificationController.getVerificationDetails(req, res)
  );

  /**
   * Get pending verifications (admin)
   */
  router.get('/admin/verifications/pending', verifyToken, authorizeRole('admin'), (req, res) =>
    verificationController.getPendingVerifications(req, res)
  );

  /**
   * Approve verification (admin)
   */
  router.post('/admin/verifications/:id/approve', verifyToken, authorizeRole('admin'), (req, res) =>
    verificationController.approveVerification(req, res)
  );

  /**
   * Reject verification (admin)
   */
  router.post('/admin/verifications/:id/reject', verifyToken, authorizeRole('admin'), (req, res) =>
    verificationController.rejectVerification(req, res)
  );

  // ============ REVIEWS & RATINGS ROUTES ============

  /**
   * Create review
   */
  router.post('/reviews', verifyToken, (req, res) =>
    reviewController.createReview(req, res)
  );

  /**
   * Get reviews for a user
   */
  router.get('/reviews/user/:userId', (req, res) =>
    reviewController.getReviewsForUser(req, res)
  );

  /**
   * Get reviews for a property
   */
  router.get('/reviews/property/:propertyId', (req, res) =>
    reviewController.getReviewsForProperty(req, res)
  );

  /**
   * Get my reviews
   */
  router.get('/reviews/my-reviews', verifyToken, (req, res) =>
    reviewController.getMyReviews(req, res)
  );

  /**
   * Get average rating for a user
   */
  router.get('/reviews/rating/:userId', (req, res) =>
    reviewController.getAverageRating(req, res)
  );

  /**
   * Update review
   */
  router.put('/reviews/:reviewId', verifyToken, (req, res) =>
    reviewController.updateReview(req, res)
  );

  /**
   * Delete review
   */
  router.delete('/reviews/:reviewId', verifyToken, (req, res) =>
    reviewController.deleteReview(req, res)
  );

  /**
   * Get reviews by rating range
   */
  router.get('/reviews/user/:userId/rating-range', (req, res) =>
    reviewController.getReviewsByRating(req, res)
  );

  // ============ DISPUTES ROUTES ============

  /**
   * Create dispute
   */
  router.post('/disputes', verifyToken, (req, res) =>
    disputeController.createDispute(req, res)
  );

  /**
   * Get my disputes
   */
  router.get('/disputes/my-disputes', verifyToken, (req, res) =>
    disputeController.getUserDisputes(req, res)
  );

  /**
   * Get dispute details
   */
  router.get('/disputes/:id', verifyToken, (req, res) =>
    disputeController.getDisputeDetails(req, res)
  );

  /**
   * Get all disputes (admin)
   */
  router.get('/admin/disputes', verifyToken, authorizeRole('admin'), (req, res) =>
    disputeController.getAllDisputes(req, res)
  );

  /**
   * Update dispute status (admin)
   */
  router.put('/admin/disputes/:id/status', verifyToken, authorizeRole('admin'), (req, res) =>
    disputeController.updateDisputeStatus(req, res)
  );

  /**
   * Resolve dispute (admin)
   */
  router.post('/admin/disputes/:id/resolve', verifyToken, authorizeRole('admin'), (req, res) =>
    disputeController.resolveDispute(req, res)
  );

  /**
   * Close dispute (admin)
   */
  router.post('/admin/disputes/:id/close', verifyToken, authorizeRole('admin'), (req, res) =>
    disputeController.closeDispute(req, res)
  );

  // ============ PAYMENTS & ESCROW ROUTES ============

  /**
   * Create payment with escrow
   */
  router.post('/payments/create', verifyToken, rateLimit(5, 3600000), (req, res) =>
    paymentController.createPayment(req, res)
  );

  /**
   * Verify payment
   */
  router.post('/payments/:id/verify', verifyToken, (req, res) =>
    paymentController.verifyPayment(req, res)
  );

  /**
   * Get my payments
   */
  router.get('/payments/my-payments', verifyToken, (req, res) =>
    paymentController.getMyPayments(req, res)
  );

  /**
   * Get payment details
   */
  router.get('/payments/:id', verifyToken, (req, res) =>
    paymentController.getPaymentDetails(req, res)
  );

  /**
   * Refund payment
   */
  router.post('/payments/:id/refund', verifyToken, (req, res) =>
    paymentController.refundPayment(req, res)
  );

  /**
   * Get escrow details
   */
  router.get('/escrow/:paymentId', verifyToken, (req, res) =>
    paymentController.getEscrowDetails(req, res)
  );

  /**
   * Release escrow
   */
  router.post('/escrow/:id/release', verifyToken, authorizeRole('admin'), (req, res) =>
    paymentController.releaseEscrow(req, res)
  );

  /**
   * Refund escrow
   */
  router.post('/escrow/:id/refund', verifyToken, authorizeRole('admin'), (req, res) =>
    paymentController.refundEscrow(req, res)
  );

  /**
   * Get held escrow (admin analytics)
   */
  router.get('/admin/escrow/held', verifyToken, authorizeRole('admin'), (req, res) =>
    paymentController.getHeldEscrow(req, res)
  );

  /**
   * Mark escrow as disputed
   */
  router.post('/escrow/:id/dispute', verifyToken, (req, res) =>
    paymentController.markEscrowAsDisputed(req, res)
  );

  // ============ NOTIFICATIONS ROUTES ============

  /**
   * Get notifications
   */
  router.get('/notifications', verifyToken, (req, res) =>
    notificationController.getNotifications(req, res)
  );

  /**
   * Get unread count
   */
  router.get('/notifications/unread/count', verifyToken, (req, res) =>
    notificationController.getUnreadCount(req, res)
  );

  /**
   * Mark notification as read
   */
  router.put('/notifications/:id/read', verifyToken, (req, res) =>
    notificationController.markAsRead(req, res)
  );

  /**
   * Mark all as read
   */
  router.put('/notifications/mark-all-read', verifyToken, (req, res) =>
    notificationController.markAllAsRead(req, res)
  );

  /**
   * Delete notification
   */
  router.delete('/notifications/:id', verifyToken, (req, res) =>
    notificationController.deleteNotification(req, res)
  );

  /**
   * Delete all notifications
   */
  router.delete('/notifications/all', verifyToken, (req, res) =>
    notificationController.deleteAllNotifications(req, res)
  );

  /**
   * Get notifications by type
   */
  router.get('/notifications/type/:type', verifyToken, (req, res) =>
    notificationController.getNotificationsByType(req, res)
  );

  // ============ FEATURED LISTINGS ROUTES ============

  /**
   * Get featured listings
   */
  router.get('/listings/featured/:type', (req, res) =>
    featuredListingsController.getFeaturedListings(req, res)
  );

  /**
   * Check if listing is featured
   */
  router.get('/listings/:type/:id/is-featured', (req, res) =>
    featuredListingsController.isListingFeatured(req, res)
  );

  /**
   * Get my featured listings
   */
  router.get('/listings/featured-mine/:type', verifyToken, (req, res) =>
    featuredListingsController.getMyFeaturedListings(req, res)
  );

  /**
   * Create featured listing
   */
  router.post('/listings/:type/:id/feature', verifyToken, (req, res) =>
    featuredListingsController.createFeaturedListing(req, res)
  );

  /**
   * Extend featured listing
   */
  router.put('/listings/featured/:id/extend', verifyToken, (req, res) =>
    featuredListingsController.extendFeaturedListing(req, res)
  );

  /**
   * Deactivate featured listing
   */
  router.delete('/listings/featured/:id', verifyToken, (req, res) =>
    featuredListingsController.deactivateFeaturedListing(req, res)
  );

  return router;
};
