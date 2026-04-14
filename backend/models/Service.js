/**
 * Service Provider Model
 * Database operations for service providers and their services
 */

const pool = require('../app').pool;

class Service {
  /**
   * Create a new service
   * @param {Object} serviceData - { provider_id, service_name, description, price, availability, category }
   * @returns {Promise<Object>} Created service
   */
  async create(serviceData) {
    try {
      const { provider_id, service_name, description, price, availability = {}, category, is_featured = false } = serviceData;

      const query = `
        INSERT INTO services 
        (provider_id, service_name, description, price, availability, category, is_featured, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `;

      const values = [
        provider_id,
        service_name,
        description,
        price,
        JSON.stringify(availability),
        category,
        is_featured
      ];

      const result = await pool.query(query, values);
      const service = result.rows[0];

      if (service.availability) service.availability = JSON.parse(service.availability);

      return service;
    } catch (error) {
      throw new Error(`Error creating service: ${error.message}`);
    }
  }

  /**
   * Get all active services with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 12)
   * @returns {Promise<Array>} Array of services
   */
  async getAll(page = 1, limit = 12) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT s.*, u.name as provider_name, u.phone as provider_phone
        FROM services s
        JOIN users u ON s.provider_id = u.id
        WHERE s.status = 'active'
        ORDER BY s.is_featured DESC, s.views_count DESC, s.created_at DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await pool.query(query, [limit, offset]);

      return result.rows.map(row => ({
        ...row,
        availability: row.availability ? JSON.parse(row.availability) : {}
      }));
    } catch (error) {
      throw new Error(`Error fetching services: ${error.message}`);
    }
  }

  /**
   * Get single service by ID
   * @param {number} id - Service ID
   * @returns {Promise<Object>} Service with provider details
   */
  async getById(id) {
    try {
      const query = `
        SELECT s.*, u.id as provider_id, u.name as provider_name, u.phone as provider_phone, u.email as provider_email
        FROM services s
        JOIN users u ON s.provider_id = u.id
        WHERE s.id = $1 AND s.status = 'active'
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const service = result.rows[0];
      service.availability = service.availability ? JSON.parse(service.availability) : {};

      // Increment views
      await this.incrementViews(id);

      return service;
    } catch (error) {
      throw new Error(`Error fetching service: ${error.message}`);
    }
  }

  /**
   * Get all services by provider (owner)
   * @param {number} provider_id - Service provider user ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Array>} Array of provider's services
   */
  async getByProviderId(provider_id, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT * FROM services
        WHERE provider_id = $1
        ORDER BY is_featured DESC, created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await pool.query(query, [provider_id, limit, offset]);

      return result.rows.map(row => ({
        ...row,
        availability: row.availability ? JSON.parse(row.availability) : {}
      }));
    } catch (error) {
      throw new Error(`Error fetching provider's services: ${error.message}`);
    }
  }

  /**
   * Update service
   * @param {number} id - Service ID
   * @param {number} provider_id - Provider ID (for ownership verification)
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated service
   */
  async update(id, provider_id, updateData) {
    try {
      // Verify ownership
      const ownerCheck = await pool.query(
        'SELECT id FROM services WHERE id = $1 AND provider_id = $2',
        [id, provider_id]
      );

      if (ownerCheck.rows.length === 0) {
        throw new Error('Unauthorized: You can only update your own services');
      }

      const { service_name, description, price, availability, category, is_featured } = updateData;
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      if (service_name !== undefined) {
        updateFields.push(`service_name = $${paramCount++}`);
        values.push(service_name);
      }
      if (description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        values.push(description);
      }
      if (price !== undefined) {
        updateFields.push(`price = $${paramCount++}`);
        values.push(price);
      }
      if (availability !== undefined) {
        updateFields.push(`availability = $${paramCount++}`);
        values.push(JSON.stringify(availability));
      }
      if (category !== undefined) {
        updateFields.push(`category = $${paramCount++}`);
        values.push(category);
      }
      if (is_featured !== undefined) {
        updateFields.push(`is_featured = $${paramCount++}`);
        values.push(is_featured);
      }

      updateFields.push(`updated_at = NOW()`);

      values.push(id);
      const query = `
        UPDATE services
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      const service = result.rows[0];

      if (service.availability) service.availability = JSON.parse(service.availability);

      return service;
    } catch (error) {
      throw new Error(`Error updating service: ${error.message}`);
    }
  }

  /**
   * Soft delete service (mark as inactive)
   * @param {number} id - Service ID
   * @param {number} provider_id - Provider ID (for verification)
   * @returns {Promise<boolean>} Success status
   */
  async delete(id, provider_id) {
    try {
      // Verify ownership
      const ownerCheck = await pool.query(
        'SELECT id FROM services WHERE id = $1 AND provider_id = $2',
        [id, provider_id]
      );

      if (ownerCheck.rows.length === 0) {
        throw new Error('Unauthorized: You can only delete your own services');
      }

      await pool.query(
        'UPDATE services SET status = $1, updated_at = NOW() WHERE id = $2',
        ['inactive', id]
      );

      return true;
    } catch (error) {
      throw new Error(`Error deleting service: ${error.message}`);
    }
  }

  /**
   * Search services by category
   * @param {string} category - Category name
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Array>} Filtered services
   */
  async searchByCategory(category, page = 1, limit = 12) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT s.*, u.name as provider_name
        FROM services s
        JOIN users u ON s.provider_id = u.id
        WHERE s.category ILIKE $1 AND s.status = 'active'
        ORDER BY s.is_featured DESC, s.views_count DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await pool.query(query, [`%${category}%`, limit, offset]);

      return result.rows.map(row => ({
        ...row,
        availability: row.availability ? JSON.parse(row.availability) : {}
      }));
    } catch (error) {
      throw new Error(`Error searching by category: ${error.message}`);
    }
  }

  /**
   * Search services by price range
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Array>} Filtered services
   */
  async searchByPrice(minPrice, maxPrice, page = 1, limit = 12) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT s.*, u.name as provider_name
        FROM services s
        JOIN users u ON s.provider_id = u.id
        WHERE s.price >= $1 AND s.price <= $2 AND s.status = 'active'
        ORDER BY s.price ASC, s.created_at DESC
        LIMIT $3 OFFSET $4
      `;

      const result = await pool.query(query, [minPrice, maxPrice, limit, offset]);

      return result.rows.map(row => ({
        ...row,
        availability: row.availability ? JSON.parse(row.availability) : {}
      }));
    } catch (error) {
      throw new Error(`Error searching by price: ${error.message}`);
    }
  }

  /**
   * Get available services (has availability)
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Array>} Available services
   */
  async getAvailable(page = 1, limit = 12) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT s.*, u.name as provider_name
        FROM services s
        JOIN users u ON s.provider_id = u.id
        WHERE s.status = 'active' AND s.availability IS NOT NULL
        ORDER BY s.is_featured DESC, s.views_count DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await pool.query(query, [limit, offset]);

      return result.rows.map(row => ({
        ...row,
        availability: row.availability ? JSON.parse(row.availability) : {}
      }));
    } catch (error) {
      throw new Error(`Error fetching available services: ${error.message}`);
    }
  }

  /**
   * Increment view count for service
   * @param {number} id - Service ID
   */
  async incrementViews(id) {
    try {
      await pool.query(
        'UPDATE services SET views_count = views_count + 1 WHERE id = $1',
        [id]
      );
    } catch (error) {
      console.error('Error incrementing views:', error.message);
    }
  }

  /**
   * Get total count of services
   * @returns {Promise<number>} Total services count
   */
  async getTotalCount() {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM services WHERE status = \'active\''
      );
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      throw new Error(`Error getting total count: ${error.message}`);
    }
  }

  /**
   * Get featured services
   * @param {number} limit - Number of featured items (default: 6)
   * @returns {Promise<Array>} Featured services
   */
  async getFeatured(limit = 6) {
    try {
      const query = `
        SELECT s.*, u.name as provider_name
        FROM services s
        JOIN users u ON s.provider_id = u.id
        WHERE s.is_featured = true AND s.status = 'active'
        ORDER BY s.views_count DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);

      return result.rows.map(row => ({
        ...row,
        availability: row.availability ? JSON.parse(row.availability) : {}
      }));
    } catch (error) {
      throw new Error(`Error fetching featured services: ${error.message}`);
    }
  }
}

module.exports = Service;
