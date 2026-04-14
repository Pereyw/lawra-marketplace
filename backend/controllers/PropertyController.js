/**
 * Property Controller
 * Handles HTTP requests for property endpoints
 */
class PropertyController {
  constructor(propertyService) {
    this.propertyService = propertyService;
  }

  /**
   * Create new property listing
   * POST /api/properties
   */
  async createProperty(req, res) {
    try {
      const property = await this.propertyService.createProperty(
        req.user.id,
        req.body
      );

      res.status(201).json({
        success: true,
        message: 'Property created successfully',
        data: property
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get all properties with pagination
   * GET /api/properties?page=1&limit=10
   */
  async getProperties(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const properties = await this.propertyService.getAllProperties(
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: properties,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: properties.length
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get single property by ID
   * GET /api/properties/:id
   */
  async getProperty(req, res) {
    try {
      const property = await this.propertyService.getPropertyById(req.params.id);

      res.status(200).json({
        success: true,
        data: property
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get landlord's properties
   * GET /api/properties/landlord/mine
   */
  async getLandlordProperties(req, res) {
    try {
      const properties = await this.propertyService.getLandlordProperties(req.user.id);

      res.status(200).json({
        success: true,
        data: properties,
        count: properties.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update property
   * PUT /api/properties/:id
   */
  async updateProperty(req, res) {
    try {
      const property = await this.propertyService.updateProperty(
        req.params.id,
        req.user.id,
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'Property updated successfully',
        data: property
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete property
   * DELETE /api/properties/:id
   */
  async deleteProperty(req, res) {
    try {
      await this.propertyService.deleteProperty(req.params.id, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Property deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Search properties by location
   * GET /api/properties/search/nearby?latitude=X&longitude=Y&radius=5
   */
  async searchNearby(req, res) {
    try {
      const { latitude, longitude, radius } = req.query;

      const properties = await this.propertyService.findNearbyProperties(
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(radius) || 5
      );

      res.status(200).json({
        success: true,
        data: properties,
        count: properties.length,
        searchParams: {
          center: { latitude, longitude },
          radiusKm: radius || 5
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Search properties by price range
   * GET /api/properties/search/price?minPrice=100&maxPrice=1000
   */
  async searchByPrice(req, res) {
    try {
      const { minPrice, maxPrice } = req.query;

      const properties = await this.propertyService.searchByPriceRange(
        parseFloat(minPrice),
        parseFloat(maxPrice)
      );

      res.status(200).json({
        success: true,
        data: properties,
        count: properties.length,
        priceRange: {
          min: minPrice,
          max: maxPrice
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get property statistics
   * GET /api/properties/stats
   */
  async getStats(req, res) {
    try {
      const stats = await this.propertyService.getPropertyStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = PropertyController;
