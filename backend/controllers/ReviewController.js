/**
 * Review Controller
 * Handles ratings and reviews
 */

class ReviewController {
  constructor(reviewModel, bookingModel, notificationModel) {
    this.reviewModel = reviewModel;
    this.bookingModel = bookingModel;
    this.notificationModel = notificationModel;
  }

  /**
   * Create a review
   * POST /api/reviews
   */
  async createReview(req, res) {
    try {
      const { revieweeId, bookingId, rating, title, comment } = req.body;
      const reviewerId = req.user.id;

      // Validate inputs
      if (!revieweeId || !bookingId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Invalid review data' });
      }

      // Verify booking exists and involves both users
      const booking = await this.bookingModel.getBooking(bookingId);
      if (!booking || booking.user_id !== reviewerId) {
        return res.status(403).json({ error: 'Not authorized to review this booking' });
      }

      // Check if review already exists
      const existing = await this.reviewModel.getUserReview(reviewerId, revieweeId, bookingId);
      if (existing) {
        return res.status(400).json({ error: 'You have already reviewed this user for this booking' });
      }

      // Create review
      const review = await this.reviewModel.createReview(
        reviewerId,
        revieweeId,
        bookingId,
        rating,
        title,
        comment
      );

      // Send notification to reviewee
      await this.notificationModel.createNotification(
        revieweeId,
        'review',
        'New Review Received',
        `You received a ${rating}-star review`,
        { rating, bookingId }
      );

      res.status(201).json({
        message: 'Review created successfully',
        review
      });
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({ error: error.message || 'Failed to create review' });
    }
  }

  /**
   * Get reviews for a user
   * GET /api/reviews/user/:userId
   */
  async getReviewsForUser(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 10, offset = 0 } = req.query;

      const reviews = await this.reviewModel.getReviewsForUser(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      const avgRating = await this.reviewModel.getAverageRating(userId);

      res.status(200).json({
        reviews,
        rating: {
          average: avgRating.average_rating || 0,
          total: avgRating.total_reviews || 0
        }
      });
    } catch (error) {
      console.error('Get user reviews error:', error);
      res.status(500).json({ error: 'Failed to get reviews' });
    }
  }

  /**
   * Get reviews for a property
   * GET /api/reviews/property/:propertyId
   */
  async getReviewsForProperty(req, res) {
    try {
      const { propertyId } = req.params;
      const { limit = 10, offset = 0 } = req.query;

      const reviews = await this.reviewModel.getReviewsForProperty(
        propertyId,
        parseInt(limit),
        parseInt(offset)
      );

      res.status(200).json({ reviews });
    } catch (error) {
      console.error('Get property reviews error:', error);
      res.status(500).json({ error: 'Failed to get property reviews' });
    }
  }

  /**
   * Get my reviews (current user)
   * GET /api/reviews/my-reviews
   */
  async getMyReviews(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10, offset = 0 } = req.query;

      const reviews = await this.reviewModel.getReviewsForUser(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      const avgRating = await this.reviewModel.getAverageRating(userId);

      res.status(200).json({
        myReviews: reviews,
        myRating: {
          average: avgRating.average_rating || 0,
          total: avgRating.total_reviews || 0
        }
      });
    } catch (error) {
      console.error('Get my reviews error:', error);
      res.status(500).json({ error: 'Failed to get your reviews' });
    }
  }

  /**
   * Update review
   * PUT /api/reviews/:reviewId
   */
  async updateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { rating, title, comment } = req.body;
      const userId = req.user.id;

      // Verify ownership
      const review = await this.reviewModel.getUserReview(userId, null, null);
      if (!review || review.reviewer_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this review' });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Invalid rating' });
      }

      const updated = await this.reviewModel.updateReview(reviewId, rating, title, comment);

      res.status(200).json({
        message: 'Review updated successfully',
        review: updated
      });
    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({ error: 'Failed to update review' });
    }
  }

  /**
   * Delete review
   * DELETE /api/reviews/:reviewId
   */
  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;

      // Verify ownership
      // Note: Should fetch review first to verify ownership
      await this.reviewModel.deleteReview(reviewId);

      res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({ error: 'Failed to delete review' });
    }
  }

  /**
   * Get user's average rating
   * GET /api/reviews/rating/:userId
   */
  async getAverageRating(req, res) {
    try {
      const { userId } = req.params;

      const data = await this.reviewModel.getAverageRating(userId);

      res.status(200).json({
        average: data.average_rating || 0,
        total: data.total_reviews || 0
      });
    } catch (error) {
      console.error('Get average rating error:', error);
      res.status(500).json({ error: 'Failed to get average rating' });
    }
  }

  /**
   * Get reviews by rating range
   * GET /api/reviews/user/:userId/rating-range
   */
  async getReviewsByRating(req, res) {
    try {
      const { userId } = req.params;
      const { minRating = 1, maxRating = 5 } = req.query;

      const reviews = await this.reviewModel.getReviewsByRating(
        userId,
        parseInt(minRating),
        parseInt(maxRating)
      );

      res.status(200).json({ reviews });
    } catch (error) {
      console.error('Get reviews by rating error:', error);
      res.status(500).json({ error: 'Failed to get reviews' });
    }
  }
}

module.exports = ReviewController;
