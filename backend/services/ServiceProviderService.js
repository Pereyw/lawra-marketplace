/**
 * Service Provider Service
 * Business logic for service provider operations
 */

class ServiceProviderService {
  constructor(serviceModel) {
    this.serviceModel = serviceModel;
  }

  /**
   * Validate service input
   * @param {Object} data - Service data
   * @param {boolean} isPartial - Allow partial updates
   * @throws {Error} If validation fails
   */
  validateServiceInput(data, isPartial = false) {
    if (isPartial && Object.keys(data).length === 0) {
      throw new Error('At least one field must be provided for update');
    }

    if (data.service_name !== undefined) {
      if (typeof data.service_name !== 'string' || data.service_name.trim().length < 5) {
        throw new Error('Service name must be at least 5 characters long');
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

    if (data.category !== undefined) {
      const validCategories = ['plumbing', 'electrical', 'carpentry', 'painting', 'cleaning', 'landscaping', 'other'];
      if (!validCategories.includes(data.category?.toLowerCase())) {
        throw new Error(`Category must be one of: ${validCategories.join(', ')}`);
      }
    }

    if (data.availability !== undefined) {
      if (typeof data.availability !== 'object' || data.availability === null) {
        throw new Error('Availability must be an object with day/time information');
      }
    }

    if (data.is_featured !== undefined) {
      if (typeof data.is_featured !== 'boolean') {
        throw new Error('is_featured must be a boolean');
      }
    }
  }

  /**
   * Validate availability object
   * @param {Object} availability - Availability data
   * @returns {Object} Validated availability
   */
  validateAvailability(availability) {
    if (!availability || typeof availability !== 'object') {
      return {};
    }

    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const validatedAvailability = {};

    for (const [day, timeRanges] of Object.entries(availability)) {
      if (validDays.includes(day.toLowerCase())) {
        if (Array.isArray(timeRanges)) {
          validatedAvailability[day.toLowerCase()] = timeRanges.filter(range => 
            range.start && range.end && /^\d{2}:\d{2}$/.test(range.start) && /^\d{2}:\d{2}$/.test(range.end)
          );
        }
      }
    }

    return validatedAvailability;
  }

  /**
   * Create service
   * @param {number} provider_id - Service provider user ID
   * @param {Object} serviceData - Service information
   * @returns {Promise<Object>} Created service
   */
  async createService(provider_id, serviceData) {
    try {
      this.validateServiceInput(serviceData);

      const availability = this.validateAvailability(serviceData.availability);

      const service = await this.serviceModel.create({
        provider_id,
        ...serviceData,
        availability
      });

      return service;
    } catch (error) {
      throw new Error(`Error creating service: ${error.message}`);
    }
  }

  /**
   * Get all services
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated services and metadata
   */
  async getAllServices(page = 1, limit = 12) {
    try {
      if (page < 1) page = 1;
      if (limit < 1 || limit > 50) limit = 12;

      const services = await this.serviceModel.getAll(page, limit);
      const totalCount = await this.serviceModel.getTotalCount();

      return {
        success: true,
        data: services,
        pagination: {
          current_page: page,
          per_page: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching services: ${error.message}`);
    }
  }

  /**
   * Get single service
   * @param {number} id - Service ID
   * @returns {Promise<Object>} Service details
   */
  async getServiceById(id) {
    try {
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('Invalid service ID');
      }

      const service = await this.serviceModel.getById(id);

      if (!service) {
        throw new Error('Service not found');
      }

      return service;
    } catch (error) {
      throw new Error(`Error fetching service: ${error.message}`);
    }
  }

  /**
   * Get provider's services
   * @param {number} provider_id - Service provider user ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated provider services
   */
  async getProviderServices(provider_id, page = 1, limit = 10) {
    try {
      if (!Number.isInteger(provider_id) || provider_id < 1) {
        throw new Error('Invalid provider ID');
      }

      const services = await this.serviceModel.getByProviderId(provider_id, page, limit);
      const totalCount = await this.serviceModel.getTotalCount();

      return {
        success: true,
        data: services,
        pagination: {
          current_page: page,
          per_page: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching provider services: ${error.message}`);
    }
  }

  /**
   * Update service
   * @param {number} id - Service ID
   * @param {number} provider_id - Provider user ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated service
   */
  async updateService(id, provider_id, updateData) {
    try {
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('Invalid service ID');
      }

      this.validateServiceInput(updateData, true);

      if (updateData.availability) {
        updateData.availability = this.validateAvailability(updateData.availability);
      }

      const service = await this.serviceModel.update(id, provider_id, updateData);

      return service;
    } catch (error) {
      throw new Error(`Error updating service: ${error.message}`);
    }
  }

  /**
   * Delete service
   * @param {number} id - Service ID
   * @param {number} provider_id - Provider user ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteService(id, provider_id) {
    try {
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('Invalid service ID');
      }

      await this.serviceModel.delete(id, provider_id);

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
   * @returns {Promise<Object>} Search results with pagination
   */
  async searchByCategory(category, page = 1, limit = 12) {
    try {
      if (typeof category !== 'string' || category.trim().length === 0) {
        throw new Error('Category must be a non-empty string');
      }

      const services = await this.serviceModel.searchByCategory(category, page, limit);
      const totalCount = await this.serviceModel.getTotalCount();

      return {
        success: true,
        data: services,
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
   * Search services by price range
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

      const services = await this.serviceModel.searchByPrice(min, max, page, limit);
      const totalCount = await this.serviceModel.getTotalCount();

      return {
        success: true,
        data: services,
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
   * Get available services (with availability)
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Available services with pagination
   */
  async getAvailableServices(page = 1, limit = 12) {
    try {
      if (page < 1) page = 1;
      if (limit < 1 || limit > 50) limit = 12;

      const services = await this.serviceModel.getAvailable(page, limit);
      const totalCount = await this.serviceModel.getTotalCount();

      return {
        success: true,
        data: services,
        pagination: {
          current_page: page,
          per_page: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching available services: ${error.message}`);
    }
  }

  /**
   * Get featured services
   * @param {number} limit - Number of listings
   * @returns {Promise<Array>} Featured services
   */
  async getFeaturedServices(limit = 6) {
    try {
      if (limit < 1 || limit > 20) limit = 6;

      const services = await this.serviceModel.getFeatured(limit);

      return services;
    } catch (error) {
      throw new Error(`Error fetching featured services: ${error.message}`);
    }
  }

  /**
   * Get statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStats() {
    try {
      const totalCount = await this.serviceModel.getTotalCount();

      return {
        total_services: totalCount,
        featured_services: 0
      };
    } catch (error) {
      throw new Error(`Error getting statistics: ${error.message}`);
    }
  }
}

module.exports = ServiceProviderService;
