/**
 * Booking Model
 * Database operations for bookings (properties, artisans, services)
 */

const pool = require('../app').pool;

class Booking {
  /**
   * Create a new booking
   * @param {Object} bookingData - { user_id, service_id, property_id, booking_date, status, notes }
   * @returns {Promise<Object>} Created booking
   */
  async create(bookingData) {
    try {
      const { user_id, service_id, property_id, booking_date, status = 'pending', notes = '' } = bookingData;

      // Only one of service_id or property_id should be provided
      if (!service_id && !property_id) {
        throw new Error('Either service_id or property_id must be provided');
      }

      const query = `
        INSERT INTO bookings 
        (user_id, service_id, property_id, booking_date, status, notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `;

      const values = [user_id, service_id || null, property_id || null, booking_date, status, notes];

      const result = await pool.query(query, values);

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating booking: ${error.message}`);
    }
  }

  /**
   * Get booking by ID
   * @param {number} id - Booking ID
   * @returns {Promise<Object>} Booking details
   */
  async getById(id) {
    try {
      const query = `
        SELECT b.*, 
               u.name as user_name, u.email as user_email, u.phone as user_phone,
               s.service_name as service_name, s.price as service_price,
               p.title as property_title, p.price as property_price
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN artisan_listings p ON b.property_id = p.id
        WHERE b.id = $1
      `;

      const result = await pool.query(query, [id]);

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`Error fetching booking: ${error.message}`);
    }
  }

  /**
   * Get bookings by user
   * @param {number} user_id - User ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Array>} User's bookings
   */
  async getByUserId(user_id, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT b.*, 
               s.service_name, s.price as service_price,
               p.title as property_title, p.price as property_price
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN artisan_listings p ON b.property_id = p.id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await pool.query(query, [user_id, limit, offset]);

      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching user bookings: ${error.message}`);
    }
  }

  /**
   * Get bookings for service/property provider
   * @param {number} provider_id - Provider user ID
   * @param {string} type - 'service' or 'property'
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Array>} Provider's bookings
   */
  async getByProviderId(provider_id, type, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      let query = '';
      let values = [];

      if (type === 'service') {
        query = `
          SELECT b.*, u.name as user_name, u.phone as user_phone,
                 s.service_name, s.price
          FROM bookings b
          JOIN services s ON b.service_id = s.id
          JOIN users u ON b.user_id = u.id
          WHERE s.provider_id = $1
          ORDER BY b.created_at DESC
          LIMIT $2 OFFSET $3
        `;
        values = [provider_id, limit, offset];
      } else if (type === 'property') {
        query = `
          SELECT b.*, u.name as user_name, u.phone as user_phone,
                 p.title, p.price
          FROM bookings b
          JOIN artisan_listings p ON b.property_id = p.id
          JOIN users u ON b.user_id = u.id
          WHERE p.artisan_id = $1
          ORDER BY b.created_at DESC
          LIMIT $2 OFFSET $3
        `;
        values = [provider_id, limit, offset];
      }

      const result = await pool.query(query, values);

      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching provider bookings: ${error.message}`);
    }
  }

  /**
   * Update booking status
   * @param {number} id - Booking ID
   * @param {string} status - New status (pending, confirmed, completed, cancelled)
   * @returns {Promise<Object>} Updated booking
   */
  async updateStatus(id, status) {
    try {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const query = `
        UPDATE bookings 
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [status, id]);

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`Error updating booking: ${error.message}`);
    }
  }

  /**
   * Update booking
   * @param {number} id - Booking ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated booking
   */
  async update(id, updateData) {
    try {
      const { status, notes, booking_date } = updateData;
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      if (status !== undefined) {
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
          throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
        updateFields.push(`status = $${paramCount++}`);
        values.push(status);
      }

      if (notes !== undefined) {
        updateFields.push(`notes = $${paramCount++}`);
        values.push(notes);
      }

      if (booking_date !== undefined) {
        updateFields.push(`booking_date = $${paramCount++}`);
        values.push(booking_date);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push(`updated_at = NOW()`);

      values.push(id);
      const query = `
        UPDATE bookings
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`Error updating booking: ${error.message}`);
    }
  }

  /**
   * Cancel booking
   * @param {number} id - Booking ID
   * @returns {Promise<Object>} Updated booking
   */
  async cancel(id) {
    try {
      const query = `
        UPDATE bookings
        SET status = 'cancelled', updated_at = NOW()
        WHERE id = $1 AND status != 'completed'
        RETURNING *
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error('Booking not found or cannot be cancelled');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error cancelling booking: ${error.message}`);
    }
  }

  /**
   * Get bookings by status
   * @param {string} status - Booking status
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Array>} Filtered bookings
   */
  async getByStatus(status, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const query = `
        SELECT * FROM bookings
        WHERE status = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await pool.query(query, [status, limit, offset]);

      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching bookings by status: ${error.message}`);
    }
  }

  /**
   * Get total count of bookings
   * @returns {Promise<number>} Total bookings count
   */
  async getTotalCount() {
    try {
      const result = await pool.query('SELECT COUNT(*) as count FROM bookings');
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      throw new Error(`Error getting total count: ${error.message}`);
    }
  }

  /**
   * Delete booking
   * @param {number} id - Booking ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM bookings WHERE id = $1 AND status = $2 RETURNING id',
        [id, 'cancelled']
      );

      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error deleting booking: ${error.message}`);
    }
  }
}

module.exports = Booking;
