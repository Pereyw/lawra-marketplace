/**
 * Property Model
 * Handles property listing database operations: CRUD, search, location-based queries
 */
class Property {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create property listing
   * @param {Object} propertyData - Property details
   * @returns {Promise<Object>} Created property
   */
  async create(propertyData) {
    const {
      landlord_id,
      title,
      description,
      price,
      location_lat,
      location_lng,
      utilities,
      images
    } = propertyData;

    const query = `
      INSERT INTO properties (
        landlord_id, title, description, price, 
        location_lat, location_lng, utilities, images, status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW())
      RETURNING *
    `;

    const result = await this.db.query(query, [
      landlord_id,
      title,
      description,
      price,
      location_lat,
      location_lng,
      JSON.stringify(utilities),
      JSON.stringify(images)
    ]);

    return result.rows[0];
  }

  /**
   * Get all active properties with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Array>} Properties list
   */
  async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT * FROM properties 
      WHERE status = 'active'
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;

    const result = await this.db.query(query, [limit, offset]);
    return result.rows;
  }

  /**
   * Get property by ID with landlord details
   * @param {number} id - Property ID
   * @returns {Promise<Object>} Property with landlord info
   */
  async getById(id) {
    const query = `
      SELECT p.*, u.name as landlord_name, u.phone as landlord_phone
      FROM properties p
      JOIN users u ON p.landlord_id = u.id
      WHERE p.id = $1 AND p.status = 'active'
    `;

    const result = await this.db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get all properties for a landlord
   * @param {number} landlord_id - Landlord user ID
   * @returns {Promise<Array>} Landlord's properties
   */
  async getByLandlordId(landlord_id) {
    const query = `
      SELECT * FROM properties 
      WHERE landlord_id = $1 
      ORDER BY created_at DESC
    `;

    const result = await this.db.query(query, [landlord_id]);
    return result.rows;
  }

  /**
   * Update property
   * @param {number} id - Property ID
   * @param {number} landlord_id - Landlord ID (for authorization)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated property
   */
  async update(id, landlord_id, updateData) {
    const { title, description, price, utilities, images } = updateData;

    const query = `
      UPDATE properties
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        utilities = COALESCE($4, utilities),
        images = COALESCE($5, images),
        updated_at = NOW()
      WHERE id = $6 AND landlord_id = $7
      RETURNING *
    `;

    const result = await this.db.query(query, [
      title,
      description,
      price,
      utilities ? JSON.stringify(utilities) : null,
      images ? JSON.stringify(images) : null,
      id,
      landlord_id
    ]);

    return result.rows[0];
  }

  /**
   * Delete property (soft delete)
   * @param {number} id - Property ID
   * @param {number} landlord_id - Landlord ID (for authorization)
   * @returns {Promise<Object>} Deleted property
   */
  async delete(id, landlord_id) {
    const query = `
      UPDATE properties
      SET status = 'inactive', updated_at = NOW()
      WHERE id = $1 AND landlord_id = $2
      RETURNING id
    `;

    const result = await this.db.query(query, [id, landlord_id]);
    return result.rows[0];
  }

  /**
   * Search properties by location (geospatial query)
   * @param {number} latitude - Center latitude
   * @param {number} longitude - Center longitude
   * @param {number} radiusKm - Search radius in kilometers
   * @returns {Promise<Array>} Properties within radius
   */
  async searchByLocation(latitude, longitude, radiusKm = 5) {
    const query = `
      SELECT *, 
        (6371 * acos(cos(radians($1)) * cos(radians(location_lat)) * 
        cos(radians(location_lng) - radians($2)) + 
        sin(radians($1)) * sin(radians(location_lat)))) AS distance
      FROM properties
      WHERE status = 'active'
      HAVING (6371 * acos(cos(radians($1)) * cos(radians(location_lat)) * 
        cos(radians(location_lng) - radians($2)) + 
        sin(radians($1)) * sin(radians(location_lat)))) <= $3
      ORDER BY distance ASC
    `;

    const result = await this.db.query(query, [latitude, longitude, radiusKm]);
    return result.rows;
  }

  /**
   * Search properties by price range
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @returns {Promise<Array>} Properties in price range
   */
  async searchByPrice(minPrice, maxPrice) {
    const query = `
      SELECT * FROM properties
      WHERE status = 'active' AND price >= $1 AND price <= $2
      ORDER BY price ASC
    `;

    const result = await this.db.query(query, [minPrice, maxPrice]);
    return result.rows;
  }

  /**
   * Get total property count
   * @returns {Promise<number>} Total active properties
   */
  async getTotalCount() {
    const query = 'SELECT COUNT(*) as count FROM properties WHERE status = \'active\'';
    const result = await this.db.query(query);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Property;
