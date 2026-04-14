/**
 * Booking Service
 * Business logic for booking operations
 */

class BookingService {
  constructor(bookingModel, propertyModel, serviceModel) {
    this.bookingModel = bookingModel;
    this.propertyModel = propertyModel;
    this.serviceModel = serviceModel;
  }

  /**
   * Validate booking input
   * @param {Object} data - Booking data
   * @throws {Error} If validation fails
   */
  validateBookingInput(data) {
    if (!data.service_id && !data.property_id) {
      throw new Error('Either service_id or property_id must be provided');
    }

    if (data.service_id && data.property_id) {
      throw new Error('Provide either service_id or property_id, not both');
    }

    if (data.service_id !== undefined) {
      if (!Number.isInteger(data.service_id) || data.service_id < 1) {
        throw new Error('Invalid service ID');
      }
    }

    if (data.property_id !== undefined) {
      if (!Number.isInteger(data.property_id) || data.property_id < 1) {
        throw new Error('Invalid property ID');
      }
    }

    if (data.booking_date !== undefined) {
      const date = new Date(data.booking_date);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid booking date');
      }
      if (date < new Date()) {
        throw new Error('Booking date must be in the future');
      }
    }

    if (data.notes !== undefined) {
      if (typeof data.notes !== 'string' || data.notes.length > 500) {
        throw new Error('Notes must be a string with maximum 500 characters');
      }
    }
  }

  /**
   * Create booking
   * @param {number} user_id - User ID
   * @param {Object} bookingData - Booking information
   * @returns {Promise<Object>} Created booking
   */
  async createBooking(user_id, bookingData) {
    try {
      this.validateBookingInput(bookingData);

      // Verify service/property exists
      if (bookingData.service_id) {
        const service = await this.serviceModel.getById(bookingData.service_id);
        if (!service) {
          throw new Error('Service not found');
        }
      }

      if (bookingData.property_id) {
        const property = await this.propertyModel.getById(bookingData.property_id);
        if (!property) {
          throw new Error('Property not found');
        }
      }

      const booking = await this.bookingModel.create({
        user_id,
        ...bookingData
      });

      return booking;
    } catch (error) {
      throw new Error(`Error creating booking: ${error.message}`);
    }
  }

  /**
   * Get booking details
   * @param {number} id - Booking ID
   * @returns {Promise<Object>} Booking details
   */
  async getBookingById(id) {
    try {
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('Invalid booking ID');
      }

      const booking = await this.bookingModel.getById(id);

      if (!booking) {
        throw new Error('Booking not found');
      }

      return booking;
    } catch (error) {
      throw new Error(`Error fetching booking: ${error.message}`);
    }
  }

  /**
   * Get user's bookings
   * @param {number} user_id - User ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated bookings
   */
  async getUserBookings(user_id, page = 1, limit = 10) {
    try {
      if (page < 1) page = 1;
      if (limit < 1 || limit > 50) limit = 10;

      const bookings = await this.bookingModel.getByUserId(user_id, page, limit);
      const totalCount = await this.bookingModel.getTotalCount();

      return {
        success: true,
        data: bookings,
        pagination: {
          current_page: page,
          per_page: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching user bookings: ${error.message}`);
    }
  }

  /**
   * Get provider's bookings
   * @param {number} provider_id - Provider user ID
   * @param {string} type - 'service' or 'property'
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated bookings
   */
  async getProviderBookings(provider_id, type, page = 1, limit = 10) {
    try {
      if (!['service', 'property'].includes(type)) {
        throw new Error('Type must be either "service" or "property"');
      }

      if (page < 1) page = 1;
      if (limit < 1 || limit > 50) limit = 10;

      const bookings = await this.bookingModel.getByProviderId(provider_id, type, page, limit);
      const totalCount = await this.bookingModel.getTotalCount();

      return {
        success: true,
        data: bookings,
        pagination: {
          current_page: page,
          per_page: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching provider bookings: ${error.message}`);
    }
  }

  /**
   * Update booking
   * @param {number} id - Booking ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated booking
   */
  async updateBooking(id, updateData) {
    try {
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('Invalid booking ID');
      }

      // Only status, notes, and booking_date can be updated
      const validFields = ['status', 'notes', 'booking_date'];
      const dataToUpdate = {};

      for (const field of validFields) {
        if (field in updateData) {
          dataToUpdate[field] = updateData[field];
        }
      }

      if (Object.keys(dataToUpdate).length === 0) {
        throw new Error('No valid fields to update');
      }

      // Validate if updating
      if (dataToUpdate.status || dataToUpdate.booking_date) {
        this.validateBookingInput(dataToUpdate);
      }

      const booking = await this.bookingModel.update(id, dataToUpdate);

      if (!booking) {
        throw new Error('Booking not found');
      }

      return booking;
    } catch (error) {
      throw new Error(`Error updating booking: ${error.message}`);
    }
  }

  /**
   * Confirm booking (change status to confirmed)
   * @param {number} id - Booking ID
   * @returns {Promise<Object>} Updated booking
   */
  async confirmBooking(id) {
    try {
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('Invalid booking ID');
      }

      const booking = await this.bookingModel.updateStatus(id, 'confirmed');

      if (!booking) {
        throw new Error('Booking not found');
      }

      return booking;
    } catch (error) {
      throw new Error(`Error confirming booking: ${error.message}`);
    }
  }

  /**
   * Complete booking (change status to completed)
   * @param {number} id - Booking ID
   * @returns {Promise<Object>} Updated booking
   */
  async completeBooking(id) {
    try {
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('Invalid booking ID');
      }

      const booking = await this.bookingModel.updateStatus(id, 'completed');

      if (!booking) {
        throw new Error('Booking not found');
      }

      return booking;
    } catch (error) {
      throw new Error(`Error completing booking: ${error.message}`);
    }
  }

  /**
   * Cancel booking
   * @param {number} id - Booking ID
   * @returns {Promise<Object>} Cancelled booking
   */
  async cancelBooking(id) {
    try {
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('Invalid booking ID');
      }

      const booking = await this.bookingModel.cancel(id);

      return booking;
    } catch (error) {
      throw new Error(`Error cancelling booking: ${error.message}`);
    }
  }

  /**
   * Get bookings by status
   * @param {string} status - Booking status
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated bookings
   */
  async getByStatus(status, page = 1, limit = 10) {
    try {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      if (page < 1) page = 1;
      if (limit < 1 || limit > 50) limit = 10;

      const bookings = await this.bookingModel.getByStatus(status, page, limit);
      const totalCount = await this.bookingModel.getTotalCount();

      return {
        success: true,
        data: bookings,
        pagination: {
          current_page: page,
          per_page: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching bookings by status: ${error.message}`);
    }
  }

  /**
   * Get statistics
   * @returns {Promise<Object>} Booking statistics
   */
  async getStats() {
    try {
      const totalCount = await this.bookingModel.getTotalCount();

      return {
        total_bookings: totalCount
      };
    } catch (error) {
      throw new Error(`Error getting statistics: ${error.message}`);
    }
  }
}

module.exports = BookingService;
