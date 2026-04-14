/**
 * Artisan Service
 * Business logic for artisan operations
 * Handles validation and business rules
 */

class ArtisanService {
  constructor(artisanModel) {
    this.artisanModel = artisanModel;
  }

  /**
   * Validate artisan listing input
   * @param {Object} data - Listing data
   * @param {boolean} isPartial - Allow partial updates
   * @throws {Error} If validation fails
   */
  validateListingInput(data, isPartial = false) {
    if (isPartial && Object.keys(data).length === 0) {
      throw new Error('At least one field must be provided for update');
    }

    if (data.title !== undefined) {
      if (typeof data.title !== 'string' || data.title.trim().length < 5) {
        throw new Error('Title must be at least 5 characters long');
      }
    }

    if (data.description !== undefined) {
      if (typeof data.description !== 'string' || data.description.trim().length < 20) {
        throw new Error('Description must be at least 20 characters long');
      }
    }

    if (data.price !== undefined) {
      const price = parseFloat(data.price);
      if (isNaN(price) || price <= 0) {
        throw new Error('Price must be a positive number');
      }
    }

    if (data.images !== undefined) {
      if (!Array.isArray(data.images)) {
        throw new Error('Images must be an array');
      }
      if (data.images.length > 10) {
        throw new Error('Maximum 10 images allowed');
      }
      data.images.forEach((img, idx) => {
        if (typeof img !== 'string' || !this.isValidImageUrl(img)) {
          throw new Error(`Invalid image URL at index ${idx}`);
        }
      });
    }

    if (data.category !== undefined) {
      const validCategories = ['electronics', 'fashion', 'furniture', 'services', 'food', 'other'];
      if (!validCategories.includes(data.category?.toLowerCase())) {
        throw new Error(`Category must be one of: ${validCategories.join(', ')}`);
      }
    }

    if (data.is_featured !== undefined) {
      if (typeof data.is_featured !== 'boolean') {
        throw new Error('is_featured must be a boolean');
      }
    }
  }

  /**
   * Validate image URL format
   * @param {string} url - Image URL
   * @returns {boolean}
   */
  isValidImageUrl(url) {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    } catch (error) {
      return false;
    }
  }

  /**
   * Create artisan listing
   * @param {number} artisan_id - Artisan user ID
   * @param {Object} listingData - Listing information
   * @returns {Promise<Object>} Created listing
   */
  async createListing(artisan_id, listingData) {
    try {
      this.validateListingInput(listingData);

      const listing = await this.artisanModel.create({
        artisan_id,
        ...listingData
      });

      return listing;
    } catch (error) {
      throw new Error(`Error creating listing: ${error.message}`);
    }
  }

  /**
   * Get all listings
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated listings and metadata
   */
  async getAllListings(page = 1, limit = 12) {
    try {
      if (page < 1) page = 1;
      if (limit < 1 || limit > 50) limit = 12;

      const listings = await this.artisanModel.getAll(page, limit);
      const totalCount = await this.artisanModel.getTotalCount();

      return {
        success: true,
        data: listings,
        pagination: {
          current_page: page,
          per_page: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching listings: ${error.message}`);
    }
  }

  /**
   * Get single listing
   * @param {number} id - Listing ID
   * @returns {Promise<Object>} Listing details
   */
  async getListingById(id) {
    try {
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('Invalid listing ID');
      }

      const listing = await this.artisanModel.getById(id);

      if (!listing) {
        throw new Error('Listing not found');
      }

      return listing;
    } catch (error) {
      throw new Error(`Error fetching listing: ${error.message}`);
    }
  }

  /**
   * Get artisan's listings
   * @param {number} artisan_id - Artisan user ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated artisan listings
   */
  async getArtisanListings(artisan_id, page = 1, limit = 10) {
    try {
      if (!Number.isInteger(artisan_id) || artisan_id < 1) {
        throw new Error('Invalid artisan ID');
      }

      const listings = await this.artisanModel.getByArtisanId(artisan_id, page, limit);
      const totalCount = await this.artisanModel.getTotalCount();

      return {
        success: true,
        data: listings,
        pagination: {
          current_page: page,
          per_page: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching artisan listings: ${error.message}`);
    }
  }

  /**
   * Update artisan listing
   * @param {number} id - Listing ID
   * @param {number} artisan_id - Artisan user ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated listing
   */
  async updateListing(id, artisan_id, updateData) {
    try {
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('Invalid listing ID');
      }

      this.validateListingInput(updateData, true);

      const listing = await this.artisanModel.update(id, artisan_id, updateData);

      return listing;
    } catch (error) {
      throw new Error(`Error updating listing: ${error.message}`);
    }
  }

  /**
   * Delete artisan listing
   * @param {number} id - Listing ID
   * @param {number} artisan_id - Artisan user ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteListing(id, artisan_id) {
    try {
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('Invalid listing ID');
      }

      await this.artisanModel.delete(id, artisan_id);

      return true;
    } catch (error) {
      throw new Error(`Error deleting listing: ${error.message}`);
    }
  }

  /**
   * Search listings by category
   * @param {string} category - Category name
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Search results with pagination
   */
  async searchByCategory(category, page = 1, limit = 12) {
    try {
      if (typeof category !== 'string' || category.trim().length === 0) {
        throw new Error('Category must be a non-empty string');
      }

      const listings = await this.artisanModel.searchByCategory(category, page, limit);
      const totalCount = await this.artisanModel.getTotalCount();

      return {
        success: true,
        data: listings,
        query: { category },
        pagination: {
          current_page: page,
          per_page: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };
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
   * @returns {Promise<Object>} Search results with pagination
   */
  async searchByPrice(minPrice, maxPrice, page = 1, limit = 12) {
    try {
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);

      if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
        throw new Error('Prices must be valid positive numbers');
      }

      if (min > max) {
        throw new Error('Minimum price cannot be greater than maximum price');
      }

      const listings = await this.artisanModel.searchByPrice(min, max, page, limit);
      const totalCount = await this.artisanModel.getTotalCount();

      return {
        success: true,
        data: listings,
        query: { minPrice: min, maxPrice: max },
        pagination: {
          current_page: page,
          per_page: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error searching by price: ${error.message}`);
    }
  }

  /**
   * Get featured listings
   * @param {number} limit - Number of listings
   * @returns {Promise<Array>} Featured listings
   */
  async getFeaturedListings(limit = 6) {
    try {
      if (limit < 1 || limit > 20) limit = 6;

      const listings = await this.artisanModel.getFeatured(limit);

      return listings;
    } catch (error) {
      throw new Error(`Error fetching featured listings: ${error.message}`);
    }
  }

  /**
   * Get statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStats() {
    try {
      const totalCount = await this.artisanModel.getTotalCount();

      return {
        total_listings: totalCount,
        featured_listings: 0 // Can be calculated if needed
      };
    } catch (error) {
      throw new Error(`Error getting statistics: ${error.message}`);
    }
  }
}

module.exports = ArtisanService;
