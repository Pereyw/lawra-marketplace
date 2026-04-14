/**
 * Analytics Model
 * Handles analytics and metrics tracking
 */

class Analytics {
  constructor(db) {
    this.db = db;
  }

  /**
   * Record metric
   */
  async recordMetric(userId, listingType, listingId, metricType, value = 1) {
    const query = `
      INSERT INTO analytics (user_id, listing_type, listing_id, metric_type, metric_value, recorded_date)
      VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
      ON CONFLICT (user_id, listing_type, listing_id, metric_type, recorded_date)
      DO UPDATE SET metric_value = metric_value + $5;
    `;
    
    try {
      await this.db.query(query, [userId, listingType, listingId, metricType, value]);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to record metric: ${error.message}`);
    }
  }

  /**
   * Get admin dashboard statistics
   */
  async getAdminStats() {
    try {
      // Total users
      const usersQuery = 'SELECT COUNT(*) as count FROM users WHERE role != \'admin\';';
      const usersResult = await this.db.query(usersQuery);
      const totalUsers = parseInt(usersResult.rows[0].count, 10);

      // Total bookings
      const bookingsQuery = 'SELECT COUNT(*) as count FROM bookings;';
      const bookingsResult = await this.db.query(bookingsQuery);
      const totalBookings = parseInt(bookingsResult.rows[0].count, 10);

      // Total properties
      const propertiesQuery = 'SELECT COUNT(*) as count FROM properties;';
      const propertiesResult = await this.db.query(propertiesQuery);
      const totalProperties = parseInt(propertiesResult.rows[0].count, 10);

      // Total revenue (completed payments)
      const revenueQuery = `
        SELECT SUM(amount) as total FROM payments
        WHERE status = 'completed';
      `;
      const revenueResult = await this.db.query(revenueQuery);
      const totalRevenue = parseFloat(revenueResult.rows[0].total) || 0;

      // Active listings
      const activeQuery = `
        SELECT COUNT(*) as count FROM properties
        WHERE status = 'active';
      `;
      const activeResult = await this.db.query(activeQuery);
      const activeListings = parseInt(activeResult.rows[0].count, 10);

      // Verified users
      const verifiedQuery = 'SELECT COUNT(*) as count FROM users WHERE is_verified = true;';
      const verifiedResult = await this.db.query(verifiedQuery);
      const verifiedUsers = parseInt(verifiedResult.rows[0].count, 10);

      // Pending verifications
      const pendingQuery = `
        SELECT COUNT(*) as count FROM verifications
        WHERE status = 'pending';
      `;
      const pendingResult = await this.db.query(pendingQuery);
      const pendingVerifications = parseInt(pendingResult.rows[0].count, 10);

      // Open disputes
      const disputesQuery = `
        SELECT COUNT(*) as count FROM disputes
        WHERE status = 'open';
      `;
      const disputesResult = await this.db.query(disputesQuery);
      const openDisputes = parseInt(disputesResult.rows[0].count, 10);

      return {
        totalUsers,
        totalBookings,
        totalProperties,
        totalRevenue,
        activeListings,
        verifiedUsers,
        pendingVerifications,
        openDisputes
      };
    } catch (error) {
      throw new Error(`Failed to get admin stats: ${error.message}`);
    }
  }

  /**
   * Get vendor/landlord dashboard statistics
   */
  async getVendorStats(vendorId, listingType) {
    try {
      let query = '';
      
      if (listingType === 'property') {
        // Listing views
        const viewsQuery = `
          SELECT COALESCE(SUM(metric_value), 0) as views
          FROM analytics
          WHERE user_id = $1 AND metric_type = 'view';
        `;
        const viewsResult = await this.db.query(viewsQuery, [vendorId]);
        const views = parseInt(viewsResult.rows[0].views, 10);

        // Bookings
        const bookingsQuery = `
          SELECT COUNT(*) as count FROM bookings b
          JOIN properties p ON b.property_id = p.id
          WHERE p.landlord_id = $1;
        `;
        const bookingsResult = await this.db.query(bookingsQuery, [vendorId]);
        const bookings = parseInt(bookingsResult.rows[0].count, 10);

        // Earnings
        const earningsQuery = `
          SELECT SUM(p.amount) as earnings FROM payments p
          JOIN bookings b ON p.booking_id = b.id
          JOIN properties prop ON b.property_id = prop.id
          WHERE prop.landlord_id = $1 AND p.status = 'completed';
        `;
        const earningsResult = await this.db.query(earningsQuery, [vendorId]);
        const earnings = parseFloat(earningsResult.rows[0].earnings) || 0;

        // Active properties
        const activeQuery = `
          SELECT COUNT(*) as count FROM properties
          WHERE landlord_id = $1 AND status = 'active';
        `;
        const activeResult = await this.db.query(activeQuery, [vendorId]);
        const activeListings = parseInt(activeResult.rows[0].count, 10);

        return {
          views,
          bookings,
          earnings,
          activeListings,
          listingType: 'property'
        };
      }

      // Similar logic for artisans and service providers
      return {
        views: 0,
        bookings: 0,
        earnings: 0,
        activeListings: 0,
        listingType
      };
    } catch (error) {
      throw new Error(`Failed to get vendor stats: ${error.message}`);
    }
  }

  /**
   * Get listing analytics
   */
  async getListingAnalytics(listingType, listingId, days = 30) {
    const query = `
      SELECT 
        recorded_date,
        metric_type,
        SUM(metric_value) as total
      FROM analytics
      WHERE listing_type = $1 AND listing_id = $2 
        AND recorded_date >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY recorded_date, metric_type
      ORDER BY recorded_date DESC;
    `;
    
    try {
      const result = await this.db.query(query, [listingType, listingId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get listing analytics: ${error.message}`);
    }
  }

  /**
   * Get top-performing listings
   */
  async getTopListings(listingType, limit = 10) {
    const query = `
      SELECT 
        listing_id,
        SUM(metric_value) as total_metrics,
        metric_type
      FROM analytics
      WHERE listing_type = $1
      GROUP BY listing_id, metric_type
      ORDER BY total_metrics DESC
      LIMIT $2;
    `;
    
    try {
      const result = await this.db.query(query, [listingType, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get top listings: ${error.message}`);
    }
  }

  /**
   * Record page view
   */
  async recordPageView(userId, listingType, listingId) {
    return this.recordMetric(userId, listingType, listingId, 'view', 1);
  }

  /**
   * Record booking
   */
  async recordBooking(userId, listingType, listingId) {
    return this.recordMetric(userId, listingType, listingId, 'booking', 1);
  }

  /**
   * Record inquiry/message
   */
  async recordInquiry(userId, listingType, listingId) {
    return this.recordMetric(userId, listingType, listingId, 'inquiry', 1);
  }
}

module.exports = Analytics;
