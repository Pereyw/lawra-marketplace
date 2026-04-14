/**
 * Escrow Model
 * Handles escrow payment operations
 */

class Escrow {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create escrow record
   */
  async createEscrow(paymentId, bookingId, amount, releaseCondition = null) {
    const query = `
      INSERT INTO escrow (payment_id, booking_id, amount, status, release_condition)
      VALUES ($1, $2, $3, 'held', $4)
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [paymentId, bookingId, amount, releaseCondition]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create escrow: ${error.message}`);
    }
  }

  /**
   * Get escrow by payment ID
   */
  async getEscrowByPaymentId(paymentId) {
    const query = 'SELECT * FROM escrow WHERE payment_id = $1;';
    
    try {
      const result = await this.db.query(query, [paymentId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get escrow: ${error.message}`);
    }
  }

  /**
   * Get escrow by booking ID
   */
  async getEscrowByBookingId(bookingId) {
    const query = 'SELECT * FROM escrow WHERE booking_id = $1;';
    
    try {
      const result = await this.db.query(query, [bookingId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get escrow by booking: ${error.message}`);
    }
  }

  /**
   * Release escrow funds
   */
  async releaseEscrow(escrowId, releaseReason = null) {
    const query = `
      UPDATE escrow
      SET status = 'released', released_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [escrowId]);
      
      if (result.rows.length > 0) {
        const escrow = result.rows[0];
        
        // Update payment status to completed
        await this.db.query(
          'UPDATE payments SET status = \'completed\' WHERE id = $1',
          [escrow.payment_id]
        );
        
        // Update booking status to completed
        await this.db.query(
          'UPDATE bookings SET status = \'completed\' WHERE id = $1',
          [escrow.booking_id]
        );
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to release escrow: ${error.message}`);
    }
  }

  /**
   * Refund escrow funds (in case of dispute or cancellation)
   */
  async refundEscrow(escrowId, refundReason = null) {
    const query = `
      UPDATE escrow
      SET status = 'refunded', released_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [escrowId]);
      
      if (result.rows.length > 0) {
        const escrow = result.rows[0];
        
        // Update payment status to refunded
        await this.db.query(
          'UPDATE payments SET status = \'refunded\' WHERE id = $1',
          [escrow.payment_id]
        );
        
        // Update booking status to cancelled
        await this.db.query(
          'UPDATE bookings SET status = \'cancelled\' WHERE id = $1',
          [escrow.booking_id]
        );
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to refund escrow: ${error.message}`);
    }
  }

  /**
   * Mark escrow in dispute
   */
  async markDisputeEscrow(escrowId) {
    const query = `
      UPDATE escrow
      SET status = 'dispute'
      WHERE id = $1
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [escrowId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to mark escrow in dispute: ${error.message}`);
    }
  }

  /**
   * Get all held escrow (for analytics)
   */
  async getHeldEscrow() {
    const query = `
      SELECT SUM(amount) as total_held, COUNT(*) as count
      FROM escrow
      WHERE status = 'held';
    `;
    
    try {
      const result = await this.db.query(query);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to get held escrow: ${error.message}`);
    }
  }

  /**
   * Get all released escrow for user
   */
  async getReleasedEscrowForUser(userId) {
    const query = `
      SELECT e.*, b.user_id
      FROM escrow e
      JOIN bookings b ON e.booking_id = b.id
      WHERE b.user_id = $1 AND e.status = 'released'
      ORDER BY e.released_at DESC;
    `;
    
    try {
      const result = await this.db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get released escrow: ${error.message}`);
    }
  }

  /**
   * Check if escrow can be released
   */
  async canReleaseEscrow(escrowId) {
    const query = `
      SELECT e.* FROM escrow e
      WHERE e.id = $1 AND e.status = 'held';
    `;
    
    try {
      const result = await this.db.query(query, [escrowId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to check escrow status: ${error.message}`);
    }
  }
}

module.exports = Escrow;
