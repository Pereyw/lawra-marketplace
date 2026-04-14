/**
 * Property Service
 * Business logic for property operations with validation
 */
class PropertyService {
  constructor(propertyModel) {
    this.propertyModel = propertyModel;
  }

  /**
   * Create property listing
   * @param {number} landlord_id - Landlord user ID
   * @param {Object} propertyData - Property data
   * @returns {Promise<Object>} Created property
   */
  async createProperty(landlord_id, propertyData) {
    try {
      this.validatePropertyInput(propertyData);

      const property = await this.propertyModel.create({
        landlord_id,
        ...propertyData
      });

      return property;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all properties with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Array>} Properties list
   */
  async getAllProperties(page = 1, limit = 10) {
    try {
      if (page < 1 || limit < 1) {
        throw new Error('Invalid pagination parameters');
      }

      if (limit > 100) {
        throw new Error('Limit cannot exceed 100 items');
      }

      return await this.propertyModel.getAll(page, limit);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get single property by ID
   * @param {number} id - Property ID
   * @returns {Promise<Object>} Property details
   */
  async getPropertyById(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Valid property ID required');
      }

      const property = await this.propertyModel.getById(id);
      if (!property) {
        throw new Error('Property not found');
      }

      // Parse JSON fields if string
      if (typeof property.utilities === 'string') {
        property.utilities = JSON.parse(property.utilities);
      }
      if (typeof property.images === 'string') {
        property.images = JSON.parse(property.images);
      }

      return property;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get landlord's properties
   * @param {number} landlord_id - Landlord user ID
   * @returns {Promise<Array>} Landlord's properties
   */
  async getLandlordProperties(landlord_id) {
    try {
      if (!landlord_id || isNaN(landlord_id)) {
        throw new Error('Valid landlord ID required');
      }

      const properties = await this.propertyModel.getByLandlordId(landlord_id);
      return properties;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update property
   * @param {number} id - Property ID
   * @param {number} landlord_id - Landlord ID (for authorization)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated property
   */
  async updateProperty(id, landlord_id, updateData) {
    try {
      this.validatePropertyInput(updateData, true);

      const property = await this.propertyModel.update(id, landlord_id, updateData);
      if (!property) {
        throw new Error('Property not found or unauthorized access');
      }

      return property;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete property
   * @param {number} id - Property ID
   * @param {number} landlord_id - Landlord ID (for authorization)
   * @returns {Promise<Object>} Deletion result
   */
  async deleteProperty(id, landlord_id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Valid property ID required');
      }

      const result = await this.propertyModel.delete(id, landlord_id);
      if (!result) {
        throw new Error('Property not found or unauthorized access');
      }

      return { message: 'Property deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search properties by location
   * @param {number} latitude - Center latitude
   * @param {number} longitude - Center longitude
   * @param {number} radiusKm - Search radius in km
   * @returns {Promise<Array>} Properties nearby
   */
  async findNearbyProperties(latitude, longitude, radiusKm = 5) {
    try {
      if (!latitude || !longitude) {
        throw new Error('Latitude and longitude required');
      }

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Invalid coordinates - must be numbers');
      }

      if (latitude < -90 || latitude > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }

      if (longitude < -180 || longitude > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }

      if (radiusKm < 0.1 || radiusKm > 100) {
        throw new Error('Search radius must be between 0.1 and 100 km');
      }

      return await this.propertyModel.searchByLocation(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radiusKm)
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search properties by price range
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @returns {Promise<Array>} Properties in range
   */
  async searchByPriceRange(minPrice, maxPrice) {
    try {
      if (!minPrice || !maxPrice) {
        throw new Error('Min and max prices required');
      }

      if (minPrice < 0 || maxPrice < 0) {
        throw new Error('Prices cannot be negative');
      }

      if (minPrice > maxPrice) {
        throw new Error('Minimum price cannot exceed maximum price');
      }

      return await this.propertyModel.searchByPrice(minPrice, maxPrice);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate property input
   * @param {Object} data - Property data
   * @param {boolean} isPartial - Allow partial updates
   * @throws {Error} Validation error
   */
  validatePropertyInput(data, isPartial = false) {
    const { title, description, price, location_lat, location_lng, utilities, images } = data;

    if (!isPartial) {
      // Full validation for create
      if (!title || title.trim().length < 5) {
        throw new Error('Title must be at least 5 characters');
      }

      if (!description || description.trim().length < 20) {
        throw new Error('Description must be at least 20 characters and descriptive');
      }

      if (!price || price <= 0) {
        throw new Error('Valid price (> 0) required');
      }

      if (location_lat === undefined || location_lng === undefined) {
        throw new Error('Location coordinates (latitude, longitude) required');
      }

      if (!Array.isArray(images) || images.length === 0) {
        throw new Error('At least one image required');
      }

      if (images.length > 10) {
        throw new Error('Maximum 10 images allowed');
      }
    } else {
      // Partial validation for updates
      if (title && title.trim().length < 5) {
        throw new Error('Title must be at least 5 characters');
      }

      if (description && description.trim().length < 20) {
        throw new Error('Description must be at least 20 characters');
      }

      if (price !== undefined && price <= 0) {
        throw new Error('Price must be greater than 0');
      }

      if (images && (!Array.isArray(images) || images.length === 0)) {
        throw new Error('Images must be a non-empty array');
      }
    }

    if (utilities && !Array.isArray(utilities)) {
      throw new Error('Utilities must be an array');
    }
  }

  /**
   * Get nearby landmarks for property
   * (Placeholder for Google Maps integration)
   * @param {number} latitude - Property latitude
   * @param {number} longitude - Property longitude
   * @returns {Promise<Array>} Nearby landmarks
   */
  async getNearbyLandmarks(latitude, longitude) {
    try {
      // TODO: Integrate with Google Maps API
      return [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get property statistics
   * @returns {Promise<Object>} Property stats
   */
  async getPropertyStats() {
    try {
      const totalCount = await this.propertyModel.getTotalCount();
      return {
        totalProperties: totalCount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PropertyService;
