/**
 * Review Model
 * Handles review and rating data operations
 */

class Review {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create a new review
   */
  async createReview(reviewerId, revieweeId, bookingId, rating, title, comment) {
    // Check if review already exists for this user-booking combination
    const checkQuery = `
      SELECT id FROM reviews
      WHERE reviewer_id = $1 AND reviewer_id = $2 AND booking_id = $3;
    `;
    
    try {
      const existing = await this.db.query(checkQuery, [reviewerId, revieweeId, bookingId]);
      if (existing.rows.length > 0) {
        throw new Error('You have already reviewed this user for this booking');
      }

      const query = `
        INSERT INTO reviews (reviewer_id, reviewee_id, booking_id, rating, title, comment)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      
      const result = await this.db.query(query, [reviewerId, revieweeId, bookingId, rating, title, comment]);
      
      // Update average rating for reviewee
      await this.updateAverageRating(revieweeId);
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create review: ${error.message}`);
    }
  }

  /**
   * Get reviews for a user (as reviewee)
   */
  async getReviewsForUser(userId, limit = 10, offset = 0) {
    const query = `
      SELECT r.*, u.name as reviewer_name, u.profile_image
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.reviewee_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    
    try {
      const result = await this.db.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get reviews: ${error.message}`);
    }
  }

  /**
   * Get reviews for a property
   */
  async getReviewsForProperty(propertyId, limit = 10, offset = 0) {
    const query = `
      SELECT r.*, u.name as reviewer_name, u.profile_image
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.booking_id IN (
        SELECT id FROM bookings WHERE property_id = $1
      )
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    
    try {
      const result = await this.db.query(query, [propertyId, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get property reviews: ${error.message}`);
    }
  }

  /**
   * Get average rating for a user
   */
  async getAverageRating(userId) {
    const query = `
      SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews
      FROM reviews
      WHERE reviewee_id = $1;
    `;
    
    try {
      const result = await this.db.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to get average rating: ${error.message}`);
    }
  }

  /**
   * Update average rating (helper)
   */
  async updateAverageRating(userId) {
    const avgQuery = `
      SELECT AVG(rating) as avg_rating, COUNT(*) as count
      FROM reviews
      WHERE reviewee_id = $1;
    `;
    
    try {
      const result = await this.db.query(avgQuery, [userId]);
      const { avg_rating, count } = result.rows[0];
      
      // Update user rating (could also update properties/services table based on context)
      // For now, just track at user level
      return { average: avg_rating, count };
    } catch (error) {
      throw new Error(`Failed to update average rating: ${error.message}`);
    }
  }

  /**
   * Get user's review (if exists)
   */
  async getUserReview(reviewerId, revieweeId, bookingId) {
    const query = `
      SELECT * FROM reviews
      WHERE reviewer_id = $1 AND reviewee_id = $2 AND booking_id = $3;
    `;
    
    try {
      const result = await this.db.query(query, [reviewerId, revieweeId, bookingId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get user review: ${error.message}`);
    }
  }

  /**
   * Update review
   */
  async updateReview(reviewId, rating, title, comment) {
    const query = `
      UPDATE reviews
      SET rating = $2, title = $3, comment = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [reviewId, rating, title, comment]);
      if (result.rows.length > 0) {
        await this.updateAverageRating(result.rows[0].reviewee_id);
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update review: ${error.message}`);
    }
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId) {
    const query = 'DELETE FROM reviews WHERE id = $1 RETURNING reviewee_id;';
    
    try {
      const result = await this.db.query(query, [reviewId]);
      if (result.rows.length > 0) {
        await this.updateAverageRating(result.rows[0].reviewee_id);
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to delete review: ${error.message}`);
    }
  }

  /**
   * Get reviews by rating
   */
  async getReviewsByRating(userId, minRating, maxRating) {
    const query = `
      SELECT * FROM reviews
      WHERE reviewee_id = $1 AND rating >= $2 AND rating <= $3
      ORDER BY rating DESC;
    `;
    
    try {
      const result = await this.db.query(query, [userId, minRating, maxRating]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get reviews by rating: ${error.message}`);
    }
  }
}

module.exports = Review;
