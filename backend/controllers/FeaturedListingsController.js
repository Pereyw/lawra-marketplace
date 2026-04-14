/**
 * Featured Listings Controller
 * Handles featured listings operations
 */

class FeaturedListingsController {
  constructor(featuredListingsModel, paymentModel, notificationModel) {
    this.featuredListingsModel = featuredListingsModel;
    this.paymentModel = paymentModel;
    this.notificationModel = notificationModel;
  }

  /**
   * Get featured listings
   * GET /api/listings/featured/:type
   */
  async getFeaturedListings(req, res) {
    try {
      const { type } = req.params;
      const { limit = 10, offset = 0 } = req.query;

      const validTypes = ['property', 'artisan', 'service'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid listing type' });
      }

      const listings = await this.featuredListingsModel.getFeaturedListings(
        type,
        parseInt(limit),
        parseInt(offset)
      );

      res.status(200).json({
        type,
        listings,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error('Get featured listings error:', error);
      res.status(500).json({ error: 'Failed to get featured listings' });
    }
  }

  /**
   * Check if listing is featured
   * GET /api/listings/:type/:id/is-featured
   */
  async isListingFeatured(req, res) {
    try {
      const { type, id } = req.params;

      const isFeatured = await this.featuredListingsModel.isListingFeatured(type, id);

      res.status(200).json({ isFeatured });
    } catch (error) {
      console.error('Check featured status error:', error);
      res.status(500).json({ error: 'Failed to check featured status' });
    }
  }

  /**
   * Get my featured listings
   * GET /api/listings/featured-mine/:type
   */
  async getMyFeaturedListings(req, res) {
    try {
      const { type } = req.params;
      const ownerId = req.user.id;

      const validTypes = ['property', 'artisan', 'service'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid listing type' });
      }

      const listings = await this.featuredListingsModel.getFeaturedListingsForOwner(
        type,
        ownerId
      );

      res.status(200).json({ listings });
    } catch (error) {
      console.error('Get my featured listings error:', error);
      res.status(500).json({ error: 'Failed to get featured listings' });
    }
  }

  /**
   * Create featured listing (requires payment)
   * POST /api/listings/:type/:id/feature
   */
  async createFeaturedListing(req, res) {
    try {
      const { type, id } = req.params;
      const { paymentId, durationDays = 30 } = req.body;
      const userId = req.user.id;

      const validTypes = ['property', 'artisan', 'service'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid listing type' });
      }

      // Verify payment exists and is completed
      const payment = await this.paymentModel.getPayment(paymentId);
      if (!payment || payment.status !== 'completed') {
        return res.status(400).json({ error: 'Payment not found or not completed' });
      }

      // Check if listing is already featured
      const isFeatured = await this.featuredListingsModel.isListingFeatured(type, id);
      if (isFeatured) {
        return res.status(400).json({ error: 'Listing is already featured' });
      }

      // Calculate dates
      const now = new Date();
      const featuredFrom = now.toISOString().split('T')[0];
      const featuredUntil = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      // Create featured listing
      const featured = await this.featuredListingsModel.createFeaturedListing(
        type,
        id,
        paymentId,
        featuredFrom,
        featuredUntil
      );

      // Send notification
      await this.notificationModel.createNotification(
        userId,
        'featured_listing',
        'Listing Featured',
        `Your ${type} listing has been featured for ${durationDays} days`,
        { type, listingId: id, durationDays }
      );

      res.status(201).json({
        message: 'Listing featured successfully',
        featured
      });
    } catch (error) {
      console.error('Create featured listing error:', error);
      res.status(500).json({ error: error.message || 'Failed to feature listing' });
    }
  }

  /**
   * Extend featured listing
   * PUT /api/listings/featured/:id/extend
   */
  async extendFeaturedListing(req, res) {
    try {
      const { id } = req.params;
      const { durationDays = 30 } = req.body;

      // Calculate new date
      const featured = await this.featuredListingsModel.getEscrowByPaymentId(id);
      if (!featured) {
        return res.status(404).json({ error: 'Featured listing not found' });
      }

      const currentUntil = new Date(featured.featured_until);
      const newUntil = new Date(currentUntil.getTime() + durationDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const extended = await this.featuredListingsModel.extendFeaturedListing(id, newUntil);

      res.status(200).json({
        message: 'Featured listing extended',
        featured: extended
      });
    } catch (error) {
      console.error('Extend featured listing error:', error);
      res.status(500).json({ error: 'Failed to extend featured listing' });
    }
  }

  /**
   * Deactivate featured listing
   * DELETE /api/listings/featured/:id
   */
  async deactivateFeaturedListing(req, res) {
    try {
      const { id } = req.params;

      const featured = await this.featuredListingsModel.deactivateFeaturedListing(id);

      res.status(200).json({
        message: 'Featured listing deactivated',
        featured
      });
    } catch (error) {
      console.error('Deactivate featured listing error:', error);
      res.status(500).json({ error: 'Failed to deactivate featured listing' });
    }
  }
}

module.exports = FeaturedListingsController;
