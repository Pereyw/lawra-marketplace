/**
 * FeaturedListings Model
 * Handles featured listings operations
 */

class FeaturedListings {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create featured listing
   */
  async createFeaturedListing(listingType, listingId, paymentId, featuredFrom, featuredUntil) {
    const query = `
      INSERT INTO featured_listings (listing_type, listing_id, payment_id, featured_from, featured_until, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [listingType, listingId, paymentId, featuredFrom, featuredUntil]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create featured listing: ${error.message}`);
    }
  }

  /**
   * Get featured listings
   */
  async getFeaturedListings(listingType, limit = 10, offset = 0) {
    const query = `
      SELECT * FROM featured_listings
      WHERE listing_type = $1 AND is_active = true
        AND featured_from <= CURRENT_DATE AND featured_until >= CURRENT_DATE
      ORDER BY featured_from DESC
      LIMIT $2 OFFSET $3;
    `;
    
    try {
      const result = await this.db.query(query, [listingType, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get featured listings: ${error.message}`);
    }
  }

  /**
   * Check if listing is featured
   */
  async isListingFeatured(listingType, listingId) {
    const query = `
      SELECT id FROM featured_listings
      WHERE listing_type = $1 AND listing_id = $2 
        AND is_active = true
        AND featured_from <= CURRENT_DATE AND featured_until >= CURRENT_DATE;
    `;
    
    try {
      const result = await this.db.query(query, [listingType, listingId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to check featured status: ${error.message}`);
    }
  }

  /**
   * Deactivate featured listing
   */
  async deactivateFeaturedListing(featuredListingId) {
    const query = `
      UPDATE featured_listings
      SET is_active = false
      WHERE id = $1
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [featuredListingId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to deactivate featured listing: ${error.message}`);
    }
  }

  /**
   * Get featured listings for user/owner
   */
  async getFeaturedListingsForOwner(listingType, ownerId) {
    let query = '';
    if (listingType === 'property') {
      query = `
        SELECT fl.* FROM featured_listings fl
        JOIN properties p ON fl.listing_id = p.id
        WHERE fl.listing_type = 'property' AND p.landlord_id = $1
        ORDER BY fl.created_at DESC;
      `;
    } else if (listingType === 'artisan') {
      query = `
        SELECT fl.* FROM featured_listings fl
        JOIN artisan_listings al ON fl.listing_id = al.id
        WHERE fl.listing_type = 'artisan' AND al.artisan_id = $1
        ORDER BY fl.created_at DESC;
      `;
    } else if (listingType === 'service') {
      query = `
        SELECT fl.* FROM featured_listings fl
        JOIN services s ON fl.listing_id = s.id
        WHERE fl.listing_type = 'service' AND s.provider_id = $1
        ORDER BY fl.created_at DESC;
      `;
    }
    
    try {
      const result = await this.db.query(query, [ownerId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get featured listings for owner: ${error.message}`);
    }
  }

  /**
   * Extend featured listing
   */
  async extendFeaturedListing(featuredListingId, newFeaturedUntil) {
    const query = `
      UPDATE featured_listings
      SET featured_until = $2, is_active = true
      WHERE id = $1
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [featuredListingId, newFeaturedUntil]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to extend featured listing: ${error.message}`);
    }
  }
}

module.exports = FeaturedListings;
