/**
 * Artisan Controller
 * HTTP request handlers for artisan operations
 */

class ArtisanController {
  constructor(artisanService) {
    this.artisanService = artisanService;
  }

  /**
   * Create artisan listing
   * POST /api/artisans
   */
  async createListing(req, res) {
    try {
      const { title, description, price, images, category } = req.body;

      const listing = await this.artisanService.createListing(req.user.id, {
        title,
        description,
        price,
        images,
        category
      });

      res.status(201).json({
        success: true,
        message: 'Listing created successfully',
        data: listing
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all artisan listings
   * GET /api/artisans
   */
  async getListings(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;

      const result = await this.artisanService.getAllListings(page, limit);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get single artisan listing
   * GET /api/artisans/:id
   */
  async getListing(req, res) {
    try {
      const { id } = req.params;

      const listing = await this.artisanService.getListingById(parseInt(id));

      res.status(200).json({
        success: true,
        data: listing
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
   * Get current artisan's listings
   * GET /api/artisans/me/listings
   */
  async getMyListings(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.artisanService.getArtisanListings(req.user.id, page, limit);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update artisan listing
   * PUT /api/artisans/:id
   */
  async updateListing(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const listing = await this.artisanService.updateListing(
        parseInt(id),
        req.user.id,
        updateData
      );

      res.status(200).json({
        success: true,
        message: 'Listing updated successfully',
        data: listing
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
   * Delete artisan listing
   * DELETE /api/artisans/:id
   */
  async deleteListing(req, res) {
    try {
      const { id } = req.params;

      await this.artisanService.deleteListing(parseInt(id), req.user.id);

      res.status(200).json({
        success: true,
        message: 'Listing deleted successfully'
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
   * Search artisans by category
   * GET /api/artisans/search/category
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

      const result = await this.artisanService.searchByCategory(category, page, limit);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Search artisans by price
   * GET /api/artisans/search/price
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

      const result = await this.artisanService.searchByPrice(
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
   * Get featured artisan listings
   * GET /api/artisans/featured
   */
  async getFeatured(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 6;

      const listings = await this.artisanService.getFeaturedListings(limit);

      res.status(200).json({
        success: true,
        data: listings
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
   * GET /api/artisans/stats
   */
  async getStats(req, res) {
    try {
      const stats = await this.artisanService.getStats();

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

module.exports = ArtisanController;
