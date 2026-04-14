/**
 * Verification Model
 * Handles KYC verification data operations
 */

class Verification {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create verification request
   */
  async createVerification(userId, idType, idNumber, documentUrl) {
    const query = `
      INSERT INTO verifications (user_id, id_type, id_number, document_url, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [userId, idType, idNumber, documentUrl]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create verification: ${error.message}`);
    }
  }

  /**
   * Get verification by user ID
   */
  async getVerificationByUserId(userId) {
    const query = 'SELECT * FROM verifications WHERE user_id = $1;';
    
    try {
      const result = await this.db.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get verification: ${error.message}`);
    }
  }

  /**
   * Get all pending verifications (for admin)
   */
  async getPendingVerifications(limit = 20, offset = 0) {
    const query = `
      SELECT v.*, u.name, u.email, u.phone
      FROM verifications v
      JOIN users u ON v.user_id = u.id
      WHERE v.status = 'pending'
      ORDER BY v.created_at ASC
      LIMIT $1 OFFSET $2;
    `;
    
    try {
      const result = await this.db.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get pending verifications: ${error.message}`);
    }
  }

  /**
   * Count pending verifications
   */
  async countPendingVerifications() {
    const query = 'SELECT COUNT(*) as count FROM verifications WHERE status = \'pending\';';
    
    try {
      const result = await this.db.query(query);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      throw new Error(`Failed to count pending verifications: ${error.message}`);
    }
  }

  /**
   * Approve verification
   */
  async approveVerification(verificationId, adminId) {
    const query = `
      UPDATE verifications
      SET status = 'approved', verified_by = $2, verified_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [verificationId, adminId]);
      const verification = result.rows[0];

      // Update user is_verified flag
      if (verification) {
        await this.db.query(
          'UPDATE users SET is_verified = true WHERE id = $1;',
          [verification.user_id]
        );
      }

      return verification;
    } catch (error) {
      throw new Error(`Failed to approve verification: ${error.message}`);
    }
  }

  /**
   * Reject verification
   */
  async rejectVerification(verificationId, adminId, rejectionReason) {
    const query = `
      UPDATE verifications
      SET status = 'rejected', verified_by = $2, verified_at = CURRENT_TIMESTAMP, 
          rejection_reason = $3
      WHERE id = $1
      RETURNING *;
    `;
    
    try {
      return await this.db.query(query, [verificationId, adminId, rejectionReason]);
    } catch (error) {
      throw new Error(`Failed to reject verification: ${error.message}`);
    }
  }

  /**
   * Get verification status for user
   */
  async getVerificationStatus(userId) {
    const query = `
      SELECT status FROM verifications WHERE user_id = $1;
    `;
    
    try {
      const result = await this.db.query(query, [userId]);
      return result.rows[0]?.status || null;
    } catch (error) {
      throw new Error(`Failed to get verification status: ${error.message}`);
    }
  }

  /**
   * Update verification status
   */
  async updateVerification(verificationId, idType, idNumber, documentUrl) {
    const query = `
      UPDATE verifications
      SET id_type = $2, id_number = $3, document_url = $4, status = 'pending',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [verificationId, idType, idNumber, documentUrl]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update verification: ${error.message}`);
    }
  }
}

module.exports = Verification;
