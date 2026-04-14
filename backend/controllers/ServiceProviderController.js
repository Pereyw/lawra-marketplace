/**
 * Service Provider Controller
 * HTTP request handlers for service provider operations
 */

class ServiceProviderController {
  constructor(serviceProviderService) {
    this.serviceProviderService = serviceProviderService;
  }

  /**
   * Create service
   * POST /api/services
   */
  async createService(req, res) {
    try {
      const { service_name, description, price, availability, category } = req.body;

      const service = await this.serviceProviderService.createService(req.user.id, {
        service_name,
        description,
        price,
        availability,
        category
      });

      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: service
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all services
   * GET /api/services
   */
  async getServices(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;

      const result = await this.serviceProviderService.getAllServices(page, limit);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get single service
   * GET /api/services/:id
   */
  async getService(req, res) {
    try {
      const { id } = req.params;

      const service = await this.serviceProviderService.getServiceById(parseInt(id));

      res.status(200).json({
        success: true,
        data: service
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get provider's services
   * GET /api/services/provider/mine
   */
  async getMyServices(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.serviceProviderService.getProviderServices(req.user.id, page, limit);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update service
   * PUT /api/services/:id
   */
  async updateService(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const service = await this.serviceProviderService.updateService(
        parseInt(id),
        req.user.id,
        updateData
      );

      res.status(200).json({
        success: true,
        message: 'Service updated successfully',
        data: service
      });
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete service
   * DELETE /api/services/:id
   */
  async deleteService(req, res) {
    try {
      const { id } = req.params;

      await this.serviceProviderService.deleteService(parseInt(id), req.user.id);

      res.status(200).json({
        success: true,
        message: 'Service deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Search services by category
   * GET /api/services/search/category
   */
  async searchByCategory(req, res) {
    try {
      const { category } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category query parameter is required'
        });
      }

      const result = await this.serviceProviderService.searchByCategory(category, page, limit);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Search services by price
   * GET /api/services/search/price
   */
  async searchByPrice(req, res) {
    try {
      const { minPrice, maxPrice } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;

      if (!minPrice || !maxPrice) {
        return res.status(400).json({
          success: false,
          message: 'minPrice and maxPrice query parameters are required'
        });
      }

      const result = await this.serviceProviderService.searchByPrice(
        minPrice,
        maxPrice,
        page,
        limit
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get available services
   * GET /api/services/available
   */
  async getAvailable(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;

      const result = await this.serviceProviderService.getAvailableServices(page, limit);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get featured services
   * GET /api/services/featured
   */
  async getFeatured(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 6;

      const services = await this.serviceProviderService.getFeaturedServices(limit);

      res.status(200).json({
        success: true,
        data: services
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get statistics
   * GET /api/services/stats
   */
  async getStats(req, res) {
    try {
      const stats = await this.serviceProviderService.getStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = ServiceProviderController;
