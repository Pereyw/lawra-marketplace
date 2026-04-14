/**
 * Booking Controller
 * HTTP request handlers for booking operations
 */

class BookingController {
  constructor(bookingService) {
    this.bookingService = bookingService;
  }

  /**
   * Create booking
   * POST /api/bookings
   */
  async createBooking(req, res) {
    try {
      const { service_id, property_id, booking_date, notes } = req.body;

      const booking = await this.bookingService.createBooking(req.user.id, {
        service_id,
        property_id,
        booking_date,
        notes
      });

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get booking details
   * GET /api/bookings/:id
   */
  async getBooking(req, res) {
    try {
      const { id } = req.params;

      const booking = await this.bookingService.getBookingById(parseInt(id));

      res.status(200).json({
        success: true,
        data: booking
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
   * Get user's bookings
   * GET /api/bookings/user/me
   */
  async getUserBookings(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.bookingService.getUserBookings(req.user.id, page, limit);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get provider's bookings
   * GET /api/bookings/provider/mine
   */
  async getProviderBookings(req, res) {
    try {
      const { type } = req.query; // 'service' or 'property'
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Type query parameter is required (service or property)'
        });
      }

      const result = await this.bookingService.getProviderBookings(
        req.user.id,
        type.toLowerCase(),
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
   * Update booking
   * PUT /api/bookings/:id
   */
  async updateBooking(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const booking = await this.bookingService.updateBooking(parseInt(id), updateData);

      res.status(200).json({
        success: true,
        message: 'Booking updated successfully',
        data: booking
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Confirm booking
   * PATCH /api/bookings/:id/confirm
   */
  async confirmBooking(req, res) {
    try {
      const { id } = req.params;

      const booking = await this.bookingService.confirmBooking(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Booking confirmed successfully',
        data: booking
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
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
   * Complete booking
   * PATCH /api/bookings/:id/complete
   */
  async completeBooking(req, res) {
    try {
      const { id } = req.params;

      const booking = await this.bookingService.completeBooking(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Booking completed successfully',
        data: booking
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
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
   * Cancel booking
   * PATCH /api/bookings/:id/cancel
   */
  async cancelBooking(req, res) {
    try {
      const { id } = req.params;

      const booking = await this.bookingService.cancelBooking(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
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
   * Get bookings by status
   * GET /api/bookings/status/:status
   */
  async getByStatus(req, res) {
    try {
      const { status } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.bookingService.getByStatus(status.toLowerCase(), page, limit);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get statistics
   * GET /api/bookings/stats
   */
  async getStats(req, res) {
    try {
      const stats = await this.bookingService.getStats();

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

module.exports = BookingController;
