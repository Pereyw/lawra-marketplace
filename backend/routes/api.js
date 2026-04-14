const express = require('express');

/**
 * API Routes
 * Configures all REST API endpoints with authorization
 */
module.exports = (authController, propertyController, artisanController, serviceProviderController, bookingController, messageController, authService) => {
  const router = express.Router();
  const { verifyToken, authorizeRole, rateLimit } = require('../middleware/auth');

  // ============ PUBLIC ROUTES (No Authentication Required) ============

  /**
   * Authentication Endpoints
   */
  router.post('/auth/register', rateLimit(5, 60000), (req, res) =>
    authController.register(req, res)
  );

  router.post('/auth/login', rateLimit(10, 60000), (req, res) =>
    authController.login(req, res)
  );

  /**
   * Property Browse Endpoints (Public)
   */
  router.get('/properties', (req, res) =>
    propertyController.getProperties(req, res)
  );

  router.get('/properties/:id', (req, res) =>
    propertyController.getProperty(req, res)
  );

  router.get('/properties/search/nearby', (req, res) =>
    propertyController.searchNearby(req, res)
  );

  router.get('/properties/search/price', (req, res) =>
    propertyController.searchByPrice(req, res)
  );

  router.get('/properties/stats', (req, res) =>
    propertyController.getStats(req, res)
  );

  /**
   * Artisan Browse Endpoints (Public)
   */
  router.get('/artisans', (req, res) =>
    artisanController.getListings(req, res)
  );

  router.get('/artisans/:id', (req, res) =>
    artisanController.getListing(req, res)
  );

  router.get('/artisans/search/category', (req, res) =>
    artisanController.searchByCategory(req, res)
  );

  router.get('/artisans/search/price', (req, res) =>
    artisanController.searchByPrice(req, res)
  );

  router.get('/artisans/featured', (req, res) =>
    artisanController.getFeatured(req, res)
  );

  /**
   * Service Browse Endpoints (Public)
   */
  router.get('/services', (req, res) =>
    serviceProviderController.getServices(req, res)
  );

  router.get('/services/:id', (req, res) =>
    serviceProviderController.getService(req, res)
  );

  router.get('/services/search/category', (req, res) =>
    serviceProviderController.searchByCategory(req, res)
  );

  router.get('/services/search/price', (req, res) =>
    serviceProviderController.searchByPrice(req, res)
  );

  router.get('/services/available', (req, res) =>
    serviceProviderController.getAvailable(req, res)
  );

  router.get('/services/featured', (req, res) =>
    serviceProviderController.getFeatured(req, res)
  );

  // ============ PROTECTED ROUTES (Authentication Required) ============

  /**
   * Authentication Endpoints (Protected)
   */
  router.post('/auth/refresh', verifyToken(authService), (req, res) =>
    authController.refreshToken(req, res)
  );

  router.get('/auth/me', verifyToken(authService), (req, res) =>
    authController.getProfile(req, res)
  );

  router.post('/auth/logout', verifyToken(authService), (req, res) =>
    authController.logout(req, res)
  );

  /**
   * Property Management Endpoints (Landlord/Admin Only)
   */
  router.post(
    '/properties',
    verifyToken(authService),
    authorizeRole('landlord', 'admin'),
    (req, res) => propertyController.createProperty(req, res)
  );

  router.get(
    '/properties/landlord/mine',
    verifyToken(authService),
    authorizeRole('landlord', 'admin'),
    (req, res) => propertyController.getLandlordProperties(req, res)
  );

  router.put(
    '/properties/:id',
    verifyToken(authService),
    authorizeRole('landlord', 'admin'),
    (req, res) => propertyController.updateProperty(req, res)
  );

  router.delete(
    '/properties/:id',
    verifyToken(authService),
    authorizeRole('landlord', 'admin'),
    (req, res) => propertyController.deleteProperty(req, res)
  );

  /**
   * Artisan Management Endpoints (Artisan Only)
   */
  router.post(
    '/artisans',
    verifyToken(authService),
    authorizeRole('artisan', 'admin'),
    (req, res) => artisanController.createListing(req, res)
  );

  router.get(
    '/artisans/me/listings',
    verifyToken(authService),
    authorizeRole('artisan', 'admin'),
    (req, res) => artisanController.getMyListings(req, res)
  );

  router.put(
    '/artisans/:id',
    verifyToken(authService),
    authorizeRole('artisan', 'admin'),
    (req, res) => artisanController.updateListing(req, res)
  );

  router.delete(
    '/artisans/:id',
    verifyToken(authService),
    authorizeRole('artisan', 'admin'),
    (req, res) => artisanController.deleteListing(req, res)
  );

  /**
   * Service Management Endpoints (Service Provider Only)
   */
  router.post(
    '/services',
    verifyToken(authService),
    authorizeRole('service_provider', 'admin'),
    (req, res) => serviceProviderController.createService(req, res)
  );

  router.get(
    '/services/provider/mine',
    verifyToken(authService),
    authorizeRole('service_provider', 'admin'),
    (req, res) => serviceProviderController.getMyServices(req, res)
  );

  router.put(
    '/services/:id',
    verifyToken(authService),
    authorizeRole('service_provider', 'admin'),
    (req, res) => serviceProviderController.updateService(req, res)
  );

  router.delete(
    '/services/:id',
    verifyToken(authService),
    authorizeRole('service_provider', 'admin'),
    (req, res) => serviceProviderController.deleteService(req, res)
  );

  /**
   * Booking Management Endpoints (All authenticated users)
   */
  router.post(
    '/bookings',
    verifyToken(authService),
    (req, res) => bookingController.createBooking(req, res)
  );

  router.get(
    '/bookings/:id',
    verifyToken(authService),
    (req, res) => bookingController.getBooking(req, res)
  );

  router.get(
    '/bookings/user/me',
    verifyToken(authService),
    (req, res) => bookingController.getUserBookings(req, res)
  );

  router.get(
    '/bookings/provider/mine',
    verifyToken(authService),
    (req, res) => bookingController.getProviderBookings(req, res)
  );

  router.put(
    '/bookings/:id',
    verifyToken(authService),
    (req, res) => bookingController.updateBooking(req, res)
  );

  router.patch(
    '/bookings/:id/confirm',
    verifyToken(authService),
    (req, res) => bookingController.confirmBooking(req, res)
  );

  router.patch(
    '/bookings/:id/complete',
    verifyToken(authService),
    (req, res) => bookingController.completeBooking(req, res)
  );

  router.patch(
    '/bookings/:id/cancel',
    verifyToken(authService),
    (req, res) => bookingController.cancelBooking(req, res)
  );

  router.get(
    '/bookings/status/:status',
    verifyToken(authService),
    authorizeRole('admin'),
    (req, res) => bookingController.getByStatus(req, res)
  );

  /**
   * Messaging Endpoints (All authenticated users)
   */
  router.post(
    '/messages',
    verifyToken(authService),
    (req, res) => messageController.sendMessage(req, res)
  );

  router.post(
    '/messages/inquiry',
    verifyToken(authService),
    (req, res) => messageController.sendInquiry(req, res)
  );

  router.get(
    '/messages/conversation/:user_id',
    verifyToken(authService),
    (req, res) => messageController.getConversation(req, res)
  );

  router.get(
    '/messages/conversations',
    verifyToken(authService),
    (req, res) => messageController.getConversations(req, res)
  );

  router.get(
    '/messages/inbox',
    verifyToken(authService),
    (req, res) => messageController.getInbox(req, res)
  );

  router.get(
    '/messages/sent',
    verifyToken(authService),
    (req, res) => messageController.getSentMessages(req, res)
  );

  router.patch(
    '/messages/:id/read',
    verifyToken(authService),
    (req, res) => messageController.markAsRead(req, res)
  );

  router.patch(
    '/messages/conversation/:user_id/read',
    verifyToken(authService),
    (req, res) => messageController.markConversationAsRead(req, res)
  );

  router.get(
    '/messages/unread/count',
    verifyToken(authService),
    (req, res) => messageController.getUnreadCount(req, res)
  );

  router.get(
    '/messages/related/:type/:id',
    verifyToken(authService),
    (req, res) => messageController.getRelatedMessages(req, res)
  );

  router.delete(
    '/messages/:id',
    verifyToken(authService),
    (req, res) => messageController.deleteMessage(req, res)
  );

  router.get(
    '/messages/stats',
    verifyToken(authService),
    (req, res) => messageController.getStats(req, res)
  );

  router.get(
    '/messages/search',
    verifyToken(authService),
    (req, res) => messageController.searchMessages(req, res)
  );

  // ============ HEALTH CHECK ============

  /**
   * Health check endpoint
   */
  router.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * API version endpoint
   */
  router.get('/version', (req, res) => {
    res.status(200).json({
      success: true,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  return router;
};
