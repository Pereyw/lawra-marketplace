/**
 * Artisan Model
 * Database operations for artisan listings
 * Handles CRUD operations for artisans and their product/service listings
 */

const pool = require('../app').pool;

class Artisan {
  /**
   * Create a new artisan listing
   * @param {Object} artisanData - { artisan_id, title, description, price, images, category, is_featured }
   * @returns {Promise<Object>} Created artisan listing
   */
  async create(artisanData) {
    try {
      const { artisan_id, title, description, price, images = [], category, is_featured = false } = artisanData;

      const query = `
        INSERT INTO artisan_listings 
        (artisan_id, title, description, price, images, category, is_featured, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `;

      const values = [
        artisan_id,
        title,
        description,
        price,
        JSON.stringify(images),
        category,
        is_featured
      ];

      const result = await pool.query(query, values);
      const listing = result.rows[0];

      // Parse JSON fields
      if (listing.images) listing.images = JSON.parse(listing.images);

      return listing;
    } catch (error) {
      throw new Error(`Error creating artisan listing: ${error.message}`);
    }
  }

  /**
   * Get all active artisan listings with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 12)
   * @returns {Promise<Array>} Array of artisan listings
   */
  async getAll(page = 1, limit = 12) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT al.*, u.name as artisan_name, u.phone as artisan_phone
        FROM artisan_listings al
        JOIN users u ON al.artisan_id = u.id
        WHERE al.status = 'active'
        ORDER BY al.is_featured DESC, al.views_count DESC, al.created_at DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await pool.query(query, [limit, offset]);

      return result.rows.map(row => ({
        ...row,
        images: row.images ? JSON.parse(row.images) : []
      }));
    } catch (error) {
      throw new Error(`Error fetching artisan listings: ${error.message}`);
    }
  }

  /**
   * Get single artisan listing by ID
   * @param {number} id - Listing ID
   * @returns {Promise<Object>} Artisan listing with artisan details
   */
  async getById(id) {
    try {
      const query = `
        SELECT al.*, u.id as artisan_id, u.name as artisan_name, u.phone as artisan_phone, u.email as artisan_email
        FROM artisan_listings al
        JOIN users u ON al.artisan_id = u.id
        WHERE al.id = $1 AND al.status = 'active'
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const listing = result.rows[0];
      listing.images = listing.images ? JSON.parse(listing.images) : [];

      // Increment views
      await this.incrementViews(id);

      return listing;
    } catch (error) {
      throw new Error(`Error fetching artisan listing: ${error.message}`);
    }
  }

  /**
   * Get all listings by artisan (owner)
   * @param {number} artisan_id - Artisan user ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Array>} Array of artisan's listings
   */
  async getByArtisanId(artisan_id, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT * FROM artisan_listings
        WHERE artisan_id = $1
        ORDER BY is_featured DESC, created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await pool.query(query, [artisan_id, limit, offset]);

      return result.rows.map(row => ({
        ...row,
        images: row.images ? JSON.parse(row.images) : []
      }));
    } catch (error) {
      throw new Error(`Error fetching artisan's listings: ${error.message}`);
    }
  }

  /**
   * Update artisan listing
   * @param {number} id - Listing ID
   * @param {number} artisan_id - Artisan ID (for ownership verification)
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated listing
   */
  async update(id, artisan_id, updateData) {
    try {
      // Verify ownership
      const ownerCheck = await pool.query(
        'SELECT id FROM artisan_listings WHERE id = $1 AND artisan_id = $2',
        [id, artisan_id]
      );

      if (ownerCheck.rows.length === 0) {
        throw new Error('Unauthorized: You can only update your own listings');
      }

      const { title, description, price, images, category, is_featured } = updateData;
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      if (title !== undefined) {
        updateFields.push(`title = $${paramCount++}`);
        values.push(title);
      }
      if (description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        values.push(description);
      }
      if (price !== undefined) {
        updateFields.push(`price = $${paramCount++}`);
        values.push(price);
      }
      if (images !== undefined) {
        updateFields.push(`images = $${paramCount++}`);
        values.push(JSON.stringify(images));
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
        UPDATE artisan_listings
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      const listing = result.rows[0];

      if (listing.images) listing.images = JSON.parse(listing.images);

      return listing;
    } catch (error) {
      throw new Error(`Error updating artisan listing: ${error.message}`);
    }
  }

  /**
   * Soft delete artisan listing (mark as inactive)
   * @param {number} id - Listing ID
   * @param {number} artisan_id - Artisan ID (for verification)
   * @returns {Promise<boolean>} Success status
   */
  async delete(id, artisan_id) {
    try {
      // Verify ownership
      const ownerCheck = await pool.query(
        'SELECT id FROM artisan_listings WHERE id = $1 AND artisan_id = $2',
        [id, artisan_id]
      );

      if (ownerCheck.rows.length === 0) {
        throw new Error('Unauthorized: You can only delete your own listings');
      }

      await pool.query(
        'UPDATE artisan_listings SET status = $1, updated_at = NOW() WHERE id = $2',
        ['inactive', id]
      );

      return true;
    } catch (error) {
      throw new Error(`Error deleting artisan listing: ${error.message}`);
    }
  }

  /**
   * Search listings by category
   * @param {string} category - Category name
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Array>} Filtered listings
   */
  async searchByCategory(category, page = 1, limit = 12) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT al.*, u.name as artisan_name
        FROM artisan_listings al
        JOIN users u ON al.artisan_id = u.id
        WHERE al.category ILIKE $1 AND al.status = 'active'
        ORDER BY al.is_featured DESC, al.views_count DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await pool.query(query, [`%${category}%`, limit, offset]);

      return result.rows.map(row => ({
        ...row,
        images: row.images ? JSON.parse(row.images) : []
      }));
    } catch (error) {
      throw new Error(`Error searching by category: ${error.message}`);
    }
  }

  /**
   * Search listings by price range
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Array>} Filtered listings
   */
  async searchByPrice(minPrice, maxPrice, page = 1, limit = 12) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT al.*, u.name as artisan_name
        FROM artisan_listings al
        JOIN users u ON al.artisan_id = u.id
        WHERE al.price >= $1 AND al.price <= $2 AND al.status = 'active'
        ORDER BY al.price ASC, al.created_at DESC
        LIMIT $3 OFFSET $4
      `;

      const result = await pool.query(query, [minPrice, maxPrice, limit, offset]);

      return result.rows.map(row => ({
        ...row,
        images: row.images ? JSON.parse(row.images) : []
      }));
    } catch (error) {
      throw new Error(`Error searching by price: ${error.message}`);
    }
  }

  /**
   * Increment view count for listing
   * @param {number} id - Listing ID
   */
  async incrementViews(id) {
    try {
      await pool.query(
        'UPDATE artisan_listings SET views_count = views_count + 1 WHERE id = $1',
        [id]
      );
    } catch (error) {
      console.error('Error incrementing views:', error.message);
    }
  }

  /**
   * Get total count of listings
   * @returns {Promise<number>} Total listings count
   */
  async getTotalCount() {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM artisan_listings WHERE status = \'active\''
      );
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      throw new Error(`Error getting total count: ${error.message}`);
    }
  }

  /**
   * Get featured listings
   * @param {number} limit - Number of featured items (default: 6)
   * @returns {Promise<Array>} Featured listings
   */
  async getFeatured(limit = 6) {
    try {
      const query = `
        SELECT al.*, u.name as artisan_name
        FROM artisan_listings al
        JOIN users u ON al.artisan_id = u.id
        WHERE al.is_featured = true AND al.status = 'active'
        ORDER BY al.views_count DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);

      return result.rows.map(row => ({
        ...row,
        images: row.images ? JSON.parse(row.images) : []
      }));
    } catch (error) {
      throw new Error(`Error fetching featured listings: ${error.message}`);
    }
  }
}

module.exports = Artisan;
