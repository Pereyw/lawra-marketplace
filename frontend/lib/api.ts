import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse } from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle common errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic API methods
  async get<T>(url: string, params?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.get(url, { params });
  }

  async post<T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.post(url, data);
  }

  async put<T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.put(url, data);
  }

  async patch<T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.patch(url, data);
  }

  async delete<T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.delete(url);
  }
}

export const apiClient = new ApiClient();

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),

  register: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  }) => apiClient.post('/auth/register', userData),

  getProfile: () => apiClient.get('/auth/me'),

  refreshToken: () => apiClient.post('/auth/refresh'),

  logout: () => apiClient.post('/auth/logout'),
};

// Properties API
export const propertiesApi = {
  getProperties: (params?: any) => apiClient.get('/properties', params),

  getProperty: (id: number) => apiClient.get(`/properties/${id}`),

  createProperty: (propertyData: any) => apiClient.post('/properties', propertyData),

  updateProperty: (id: number, propertyData: any) =>
    apiClient.put(`/properties/${id}`, propertyData),

  deleteProperty: (id: number) => apiClient.delete(`/properties/${id}`),

  getLandlordProperties: () => apiClient.get('/properties/landlord/mine'),

  searchNearby: (params: any) => apiClient.get('/properties/search/nearby', params),

  searchByPrice: (params: any) => apiClient.get('/properties/search/price', params),

  getStats: () => apiClient.get('/properties/stats'),
};

// Artisans API
export const artisansApi = {
  getListings: (params?: any) => apiClient.get('/artisans', params),

  getListing: (id: number) => apiClient.get(`/artisans/${id}`),

  createListing: (listingData: any) => apiClient.post('/artisans', listingData),

  updateListing: (id: number, listingData: any) =>
    apiClient.put(`/artisans/${id}`, listingData),

  deleteListing: (id: number) => apiClient.delete(`/artisans/${id}`),

  getMyListings: () => apiClient.get('/artisans/me/listings'),

  searchByCategory: (params: any) => apiClient.get('/artisans/search/category', params),

  searchByPrice: (params: any) => apiClient.get('/artisans/search/price', params),

  getFeatured: () => apiClient.get('/artisans/featured'),
};

// Services API
export const servicesApi = {
  getServices: (params?: any) => apiClient.get('/services', params),

  getService: (id: number) => apiClient.get(`/services/${id}`),

  createService: (serviceData: any) => apiClient.post('/services', serviceData),

  updateService: (id: number, serviceData: any) =>
    apiClient.put(`/services/${id}`, serviceData),

  deleteService: (id: number) => apiClient.delete(`/services/${id}`),

  getMyServices: () => apiClient.get('/services/provider/mine'),

  searchByCategory: (params: any) => apiClient.get('/services/search/category', params),

  searchByPrice: (params: any) => apiClient.get('/services/search/price', params),

  getAvailable: () => apiClient.get('/services/available'),

  getFeatured: () => apiClient.get('/services/featured'),
};

// Bookings API
export const bookingsApi = {
  createBooking: (bookingData: any) => apiClient.post('/bookings', bookingData),

  getBooking: (id: number) => apiClient.get(`/bookings/${id}`),

  getUserBookings: () => apiClient.get('/bookings/user/me'),

  getProviderBookings: () => apiClient.get('/bookings/provider/mine'),

  updateBooking: (id: number, bookingData: any) =>
    apiClient.put(`/bookings/${id}`, bookingData),

  confirmBooking: (id: number) => apiClient.patch(`/bookings/${id}/confirm`),

  completeBooking: (id: number) => apiClient.patch(`/bookings/${id}/complete`),

  cancelBooking: (id: number) => apiClient.patch(`/bookings/${id}/cancel`),

  getByStatus: (status: string) => apiClient.get(`/bookings/status/${status}`),
};

// Messages API
export const messagesApi = {
  sendMessage: (messageData: any) => apiClient.post('/messages', messageData),

  sendInquiry: (inquiryData: any) => apiClient.post('/messages/inquiry', inquiryData),

  getConversation: (userId: number) =>
    apiClient.get(`/messages/conversation/${userId}`),

  getConversations: () => apiClient.get('/messages/conversations'),

  getInbox: () => apiClient.get('/messages/inbox'),

  getSentMessages: () => apiClient.get('/messages/sent'),

  markAsRead: (id: number) => apiClient.patch(`/messages/${id}/read`),

  markConversationAsRead: (userId: number) =>
    apiClient.patch(`/messages/conversation/${userId}/read`),

  getUnreadCount: () => apiClient.get('/messages/unread/count'),

  getRelatedMessages: (type: string, id: number) =>
    apiClient.get(`/messages/related/${type}/${id}`),

  deleteMessage: (id: number) => apiClient.delete(`/messages/${id}`),
};

// Advanced Features API
export const verificationsApi = {
  submit: (formData: FormData) =>
    apiClient.post('/verifications/submit', formData),

  getStatus: () => apiClient.get('/verifications/status'),

  getDetails: () => apiClient.get('/verifications/details'),
};

export const reviewsApi = {
  create: (reviewData: any) => apiClient.post('/reviews', reviewData),

  getForUser: (userId: number) => apiClient.get(`/reviews/user/${userId}`),

  getForProperty: (propertyId: number) =>
    apiClient.get(`/reviews/property/${propertyId}`),

  getMyReviews: () => apiClient.get('/reviews/my-reviews'),

  update: (reviewId: number, data: any) =>
    apiClient.put(`/reviews/${reviewId}`, data),

  delete: (reviewId: number) => apiClient.delete(`/reviews/${reviewId}`),

  getAverageRating: (userId: number) =>
    apiClient.get(`/reviews/rating/${userId}`),

  filterByRating: (rating: number) =>
    apiClient.get(`/reviews/filter/rating?rating=${rating}`),
};

export const disputesApi = {
  create: (disputeData: any) => apiClient.post('/disputes', disputeData),

  getMyDisputes: () => apiClient.get('/disputes/my-disputes'),

  getAll: () => apiClient.get('/admin/disputes'),

  getDetails: (disputeId: number) =>
    apiClient.get(`/admin/disputes/${disputeId}`),

  updateStatus: (disputeId: number, status: string) =>
    apiClient.put(`/admin/disputes/${disputeId}/status`, { status }),

  resolve: (disputeId: number, resolutionData: any) =>
    apiClient.post(`/admin/disputes/${disputeId}/resolve`, resolutionData),

  close: (disputeId: number) =>
    apiClient.post(`/admin/disputes/${disputeId}/close`, {}),
};

export const paymentsApi = {
  create: (paymentData: any) =>
    apiClient.post('/payments/create', paymentData),

  verify: (paymentId: number, verificationData: any) =>
    apiClient.post(`/payments/${paymentId}/verify`, verificationData),

  getMyPayments: () => apiClient.get('/payments/my-payments'),

  getDetails: (paymentId: number) =>
    apiClient.get(`/payments/${paymentId}`),

  refund: (paymentId: number, refundData: any) =>
    apiClient.post(`/payments/${paymentId}/refund`, refundData),

  // Escrow endpoints
  getHeldEscrow: () => apiClient.get('/escrow/held'),

  getEscrowDetails: (paymentId: number) =>
    apiClient.get(`/escrow/${paymentId}`),

  releaseEscrow: (paymentId: number, releaseData: any) =>
    apiClient.post(`/escrow/${paymentId}/release`, releaseData),

  refundEscrow: (paymentId: number, refundData: any) =>
    apiClient.post(`/escrow/${paymentId}/refund`, refundData),

  markEscrowDisputed: (paymentId: number) =>
    apiClient.post(`/escrow/${paymentId}/dispute`, {}),
};

export const ordersApi = {
  createOrder: (orderData: any) => apiClient.post('/orders', orderData),
  getUserOrders: () => apiClient.get('/orders/user/me'),
  getOrder: (id: number) => apiClient.get(`/orders/${id}`),
};

export const paystackApi = {
  initialize: (paymentData: any) => apiClient.post('/payments/paystack/initialize', paymentData),
  verify: (reference: string) => apiClient.get(`/payments/paystack/verify/${reference}`),
};

export const notificationsApi = {
  getAll: (limit = 20, offset = 0) =>
    apiClient.get('/notifications', { params: { limit, offset } }),

  getUnreadCount: () => apiClient.get('/notifications/unread/count'),

  markAsRead: (notificationId: number) =>
    apiClient.put(`/notifications/${notificationId}/read`, {}),

  markAllAsRead: () => apiClient.put('/notifications/mark/all', {}),

  delete: (notificationId: number) =>
    apiClient.delete(`/notifications/${notificationId}`),

  deleteAll: () => apiClient.delete('/notifications'),

  getByType: (type: string) =>
    apiClient.get(`/notifications/type/${type}`),
};

export const featuredListingsApi = {
  getByType: (type: string) => apiClient.get(`/listings/featured/${type}`),

  isListingFeatured: (listingId: number) =>
    apiClient.get(`/listings/${listingId}/featured/is`),

  getMyFeatured: () => apiClient.get('/listings/my/featured'),

  create: (type: string, listingId: number, data: any) =>
    apiClient.post(`/listings/${type}/${listingId}/feature`, data),

  extend: (listingId: number, daysData: any) =>
    apiClient.put(`/listings/featured/${listingId}/extend`, daysData),

  deactivate: (listingId: number) =>
    apiClient.delete(`/listings/featured/${listingId}`),
};

export const analyticsApi = {
  getAdminStats: (startDate?: string, endDate?: string) =>
    apiClient.get('/admin/analytics/stats', {
      params: { startDate, endDate },
    }),

  getVendorStats: (vendorId?: number, startDate?: string, endDate?: string) =>
    apiClient.get('/admin/analytics/vendor', {
      params: { vendorId, startDate, endDate },
    }),

  getListingAnalytics: (listingId: number) =>
    apiClient.get(`/admin/analytics/listing/${listingId}`),

  getTopListings: (type: string, limit = 10) =>
    apiClient.get('/admin/analytics/top-listings', {
      params: { type, limit },
    }),
};

export const geolocationApi = {
  getNearby: (lat: number, lon: number, radiusKm: number, type = 'property') =>
    apiClient.get('/listings/nearby', {
      params: { lat, lon, radiusKm, type },
    }),

  searchNearby: (params: any) =>
    apiClient.get('/listings/search/nearby', { params }),

  getStats: () => apiClient.get('/messages/stats'),

  searchMessages: (params: any) => apiClient.get('/messages/search', params),
};