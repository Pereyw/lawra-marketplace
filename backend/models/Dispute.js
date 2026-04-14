/**
 * Dispute Model
 * Handles dispute resolution data operations
 */

class Dispute {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create a new dispute
   */
  async createDispute(bookingId, complainantId, respondentId, subject, description) {
    const query = `
      INSERT INTO disputes (booking_id, complainant_id, respondent_id, subject, description, status)
      VALUES ($1, $2, $3, $4, $5, 'open')
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [bookingId, complainantId, respondentId, subject, description]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create dispute: ${error.message}`);
    }
  }

  /**
   * Get all disputes (for admin)
   */
  async getAllDisputes(status = null, limit = 20, offset = 0) {
    let query = `
      SELECT d.*, 
             c.name as complainant_name,
             r.name as respondent_name,
             b.total_amount
      FROM disputes d
      JOIN users c ON d.complainant_id = c.id
      JOIN users r ON d.respondent_id = r.id
      JOIN bookings b ON d.booking_id = b.id
    `;
    
    const params = [];
    
    if (status) {
      query += ' WHERE d.status = $1';
      params.push(status);
      query += ' ORDER BY d.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(limit, offset);
    } else {
      query += ' ORDER BY d.created_at DESC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }
    
    try {
      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get disputes: ${error.message}`);
    }
  }

  /**
   * Get dispute by ID
   */
  async getDisputeById(disputeId) {
    const query = `
      SELECT d.*, 
             c.name as complainant_name, c.email as complainant_email,
             r.name as respondent_name, r.email as respondent_email,
             admin.name as resolved_by_name
      FROM disputes d
      LEFT JOIN users c ON d.complainant_id = c.id
      LEFT JOIN users r ON d.respondent_id = r.id
      LEFT JOIN users admin ON d.resolved_by = admin.id
      WHERE d.id = $1;
    `;
    
    try {
      const result = await this.db.query(query, [disputeId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get dispute: ${error.message}`);
    }
  }

  /**
   * Get disputes for user (as complainant or respondent)
   */
  async getDisputesForUser(userId, limit = 10, offset = 0) {
    const query = `
      SELECT d.*, 
             c.name as complainant_name,
             r.name as respondent_name
      FROM disputes d
      JOIN users c ON d.complainant_id = c.id
      JOIN users r ON d.respondent_id = r.id
      WHERE d.complainant_id = $1 OR d.respondent_id = $1
      ORDER BY d.created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    
    try {
      const result = await this.db.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get user disputes: ${error.message}`);
    }
  }

  /**
   * Update dispute status
   */
  async updateDisputeStatus(disputeId, status, resolution = null, resolvedBy = null) {
    const query = `
      UPDATE disputes
      SET status = $2, resolution = $3, resolved_by = $4, 
          resolved_at = CASE WHEN $2 = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [disputeId, status, resolution, resolvedBy]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update dispute status: ${error.message}`);
    }
  }

  /**
   * Resolve dispute
   */
  async resolveDispute(disputeId, resolution, resolvedBy) {
    return this.updateDisputeStatus(disputeId, 'resolved', resolution, resolvedBy);
  }

  /**
   * Get open disputes count
   */
  async getOpenDisputesCount() {
    const query = "SELECT COUNT(*) as count FROM disputes WHERE status = 'open';";
    
    try {
      const result = await this.db.query(query);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      throw new Error(`Failed to get open disputes count: ${error.message}`);
    }
  }

  /**
   * Close dispute
   */
  async closeDispute(disputeId) {
    const query = `
      UPDATE disputes
      SET status = 'closed', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [disputeId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to close dispute: ${error.message}`);
    }
  }
}

module.exports = Dispute;
