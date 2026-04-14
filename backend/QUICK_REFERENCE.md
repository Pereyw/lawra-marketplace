# Advanced Features - Quick Reference Guide

Fast access to common usage patterns and code examples for all 10 advanced features.

## Table of Contents
- [KYC Verification](#kyc-verification)
- [Reviews & Ratings](#reviews--ratings)
- [Real-Time Chat](#real-time-chat)
- [Advanced Bookings](#advanced-bookings)
- [Escrow Payments](#escrow-payments)
- [Notifications](#notifications)
- [Featured Listings](#featured-listings)
- [Analytics](#analytics)
- [Disputes](#disputes)
- [Geolocation](#geolocation)

---

## KYC Verification

### Submit Verification (Frontend)
```javascript
// components/VerificationUpload.tsx
const submitVerification = async (formData) => {
  const data = new FormData();
  data.append('idType', formData.idType); // ghana_card, passport, drivers_license
  data.append('idNumber', formData.idNumber);
  data.append('document', formData.document); // PDF or image file

  try {
    const response = await axios.post('/api/verifications/submit', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('Verification submitted:', response.data);
  } catch (error) {
    console.error('Submission failed:', error.response?.data);
  }
};
```

### Check Verification Status (Frontend)
```javascript
const checkStatus = async () => {
  const response = await axios.get('/api/verifications/status', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  // Returns: { status: 'pending'|'approved'|'rejected', verifiedAt?: timestamp }
  console.log('Verification status:', response.data);
};
```

### Admin Approve/Reject (Admin Panel)
```javascript
// Approve
await axios.post(`/api/admin/verifications/${verificationId}/approve`, 
  { notes: 'Document verified' },
  { headers: { 'Authorization': `Bearer ${adminToken}` } }
);

// Reject
await axios.post(`/api/admin/verifications/${verificationId}/reject`,
  { notes: 'Document unclear' },
  { headers: { 'Authorization': `Bearer ${adminToken}` } }
);
```

---

## Reviews & Ratings

### Create Review (After Booking)
```javascript
const createReview = async (bookingId, reviewData) => {
  const response = await axios.post('/api/reviews', {
    revieweeId: booking.serviceProviderId,
    bookingId: bookingId,
    rating: 5, // 1-5 stars
    title: 'Excellent service',
    comment: 'Very professional and timely'
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  // Prevents duplicate reviews for same booking
};
```

### Get Reviews for Property/User
```javascript
// Get all reviews given to a user
const response = await axios.get('/api/reviews/user/123', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Returns: [{ rating, title, comment, createdAt, reviewer: {...} }]

// Get reviews for a property
const response = await axios.get('/api/reviews/property/456', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Get Average Rating
```javascript
const response = await axios.get('/api/reviews/rating/123', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Returns: { userId: 123, averageRating: 4.5, totalReviews: 28 }
```

### Filter by Rating
```javascript
const response = await axios.get('/api/reviews/filter/rating?rating=5&limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Returns only 5-star reviews
```

---

## Real-Time Chat

### Connect Socket (Frontend)
```javascript
// hooks/useSocket.ts
import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  auth: {
    token: localStorage.getItem('token'),
    userId: userId
  }
});

// Come online
socket.emit('user_online', userId);

// Listen for messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
  // Update UI
});
```

### Send Message
```javascript
socket.emit('send_message', {
  receiverId: 2,
  message: 'Hello! Is the property still available?',
  senderName: 'John'
  // senderInfo automatically included by server
});
```

### Typing Indicators
```javascript
// User starts typing
socket.emit('user_typing', {
  receiverId: 2,
  sender: 'John',
  senderName: 'John Doe'
});

// User stops typing
socket.emit('user_stopped_typing', {
  receiverId: 2,
  sender: 'John'
});

// Listen for typing indicator
socket.on('typing_indicator', (data) => {
  console.log(`${data.senderName} is typing...`);
});
```

### Get Message History
```javascript
socket.emit('get_messages', {
  userId: 2,
  limit: 50
});

socket.on('messages_history', (messages) => {
  console.log('Previous messages:', messages);
});
```

### Mark Message as Read
```javascript
socket.emit('mark_message_read', {
  messageId: 'msg_123',
  readBy: userId
});

socket.on('message_read', (data) => {
  // Update read receipt in UI
});
```

---

## Advanced Bookings

### Create Booking with Scheduled Times
```javascript
const createBooking = async (bookingData) => {
  const response = await axios.post('/api/bookings', {
    propertyId: 123,
    serviceProviderId: 2,
    scheduledStartTime: '2024-02-15T09:00:00', // ISO format
    scheduledEndTime: '2024-02-15T17:00:00',
    numberOfGuests: 2,
    totalPrice: 150.00,
    notes: 'Cleaning service needed'
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};
```

### Get Booking Details
```javascript
const response = await axios.get('/api/bookings/123', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Returns all booking data including scheduled times and real-time updates via WebSocket
```

### Real-Time Booking Updates
```javascript
// Subscribe to booking status changes
socket.emit('subscribe_booking_updates', {
  bookingId: 123
});

// Receive updates when status changes
socket.on('booking_status_changed', (bookingUpdate) => {
  console.log('Booking updated:', bookingUpdate);
  // Status: pending → confirmed → in_progress → completed → cancelled
});
```

---

## Escrow Payments

### Create Payment with Escrow Hold
```javascript
const createPaymentWithEscrow = async (paymentData) => {
  const response = await axios.post('/api/payments/create', {
    bookingId: 123,
    amount: 150.00,
    paymentMethod: 'mtn_money_or_card', // mtn_money, airtel_money, credit_card
    useEscrow: true, // Amount will be held securely
    description: 'Payment for cleaning service'
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  // Returns: { paymentId, status: 'pending', escrowId }
};
```

### Verify Payment (After payment gateway callback)
```javascript
const verifyPayment = async (paymentId) => {
  const response = await axios.post(`/api/payments/${paymentId}/verify`, {
    transactionId: 'TXN123456', // From payment provider
    status: 'success'
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};
```

### Release Escrow (Service Provider Completion)
```javascript
// Admin releases escrowed funds when service is confirmed
const response = await axios.post(`/api/escrow/${paymentId}/release`, {
  releaseReason: 'Service completed successfully'
}, {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
```

### Refund Escrow (Booking Cancelled)
```javascript
const response = await axios.post(`/api/escrow/${paymentId}/refund`, {
  refundReason: 'Booking cancelled by customer'
}, {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
```

### Check Held Escrow
```javascript
const response = await axios.get('/api/escrow/held', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Returns all currently held payments for user
```

---

## Notifications

### Get Notifications
```javascript
const response = await axios.get('/api/notifications?limit=20&offset=0', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Returns: [{ id, type, message, read, createdAt, data: {...} }]
```

### Get Unread Count
```javascript
const response = await axios.get('/api/notifications/unread/count', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Returns: { count: 5 }
```

### Mark as Read
```javascript
await axios.put(`/api/notifications/${notificationId}/read`, {}, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Mark All as Read
```javascript
await axios.put('/api/notifications/mark/all', {}, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Get by Notification Type
```javascript
// Available types: booking, payment, message, review, dispute, verification
const response = await axios.get('/api/notifications/type/booking', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Real-Time Notification (WebSocket)
```javascript
// Server broadcasts notifications in real-time
socket.on('new_notification', (notification) => {
  // { type: 'booking'|'payment'|'message'|etc, message, data }
  console.log('New notification:', notification);
  updateNotificationUI(notification);
});
```

---

## Featured Listings

### Get Featured Listings by Type
```javascript
const response = await axios.get('/api/listings/featured/property', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Types: property, artisan, service
// Returns featured listings sorted by recency
```

### Create Featured Listing
```javascript
const createFeaturedListing = async (listingData) => {
  const response = await axios.post('/api/listings/property/123/feature', {
    durationDays: 30, // Feature for 30 days
    paymentMethod: 'card'
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  // Automatically creates payment and escrow
};
```

### Check if Listing is Featured
```javascript
const response = await axios.get('/api/listings/123/featured/is', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Returns: { isFeatured: true, expiresAt: timestamp }
```

### Get My Featured Listings
```javascript
const response = await axios.get('/api/listings/my/featured', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Returns all listings featured by current user
```

### Extend Featured Period
```javascript
const response = await axios.put('/api/listings/featured/123/extend', {
  additionalDays: 30
}, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Deactivate Featured
```javascript
await axios.delete('/api/listings/featured/123', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Analytics

### Get Admin Dashboard Stats
```javascript
// Admin summary: total bookings, revenue, top performers
const stats = await analyticsModel.getAdminStats(startDate, endDate);
// Returns: { totalBookings, totalRevenue, activeUsers, topVendors[] }
```

### Get Vendor Performance
```javascript
// Vendor stats: their bookings, ratings, revenue
const stats = await analyticsModel.getVendorStats(vendorId, startDate, endDate);
// Returns: { completedBookings, totalRevenue, averageRating, cancelRate }
```

### Get Listing Analytics
```javascript
// Analytics for specific listing: views, bookings, inquiries
const analytics = await analyticsModel.getListingAnalytics(listingId);
// Returns: { views, bookings, inquiries, conversionRate }
```

### Get Top Listings
```javascript
// Most viewed/booked/successful listings
const topListings = await analyticsModel.getTopListings(type, limit = 10);
// Returns: [{ id, title, views, bookings, rating }]
```

### Recording Metrics
```javascript
// Automatically called by API endpoints, can also be manual:
await analyticsModel.recordMetric(listingId, 'page_view', 1);
await analyticsModel.recordPageView(listingId);
await analyticsModel.recordBooking(listingId);
await analyticsModel.recordInquiry(listingId);
```

---

## Disputes

### Create Dispute (Customer Initiates)
```javascript
const createDispute = async (disputeData) => {
  const response = await axios.post('/api/disputes', {
    bookingId: 123,
    title: 'Service not completed',
    description: 'Cleaner did not finish the full day as booked',
    evidenceUrl: 'https://...' // Photo/video URL
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  // Status: open → under_review → resolved → closed
};
```

### Admin View Disputes
```javascript
// Get all disputes for admin review
const response = await axios.get('/api/admin/disputes?status=open', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
```

### Get My Disputes
```javascript
const response = await axios.get('/api/disputes/my-disputes', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Update Dispute Status
```javascript
await axios.put(`/api/admin/disputes/${disputeId}/status`, {
  status: 'under_review'
}, {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
```

### Resolve Dispute (Admin)
```javascript
const response = await axios.post(`/api/admin/disputes/${disputeId}/resolve`, {
  decision: 'refund_customer', // or 'uphold_service_provider'
  resolution: 'Full refund processing',
  compensation: 150.00
}, {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
// Automatically releases/refunds escrowed funds
```

### Close Dispute
```javascript
await axios.post(`/api/admin/disputes/${disputeId}/close`, {}, {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
```

---

## Geolocation

### Calculate Distance Between Two Points
```javascript
// From geolocation utility
const distance = GeolocationUtil.calculateDistance(
  { lat: 5.6037, lon: -0.1870 }, // Accra
  { lat: 6.7969, lon: -1.5432 }  // Kumasi
);
// Returns distance in kilometers
```

### Get Bounding Box for Radius Search
```javascript
const bbox = GeolocationUtil.getBoundingBox(
  { lat: 5.6037, lon: -0.1870 },
  radiusKm = 10
);
// Returns: { north, south, east, west } for database queries
```

### Filter Results by Distance
```javascript
// Filter list of locations by max distance
const nearby = GeolocationUtil.filterByDistance(
  listings,
  { lat: 5.6037, lon: -0.1870 },
  maxDistanceKm = 5
);
// Only returns listings within 5km
```

### Sort by Distance
```javascript
// Sort listings by proximity to user
const sorted = GeolocationUtil.sortByDistance(
  listings,
  userLocation
);
// Closest first
```

### Add Distance Field to Results
```javascript
// Annotate each result with distance from user
const annotated = GeolocationUtil.addDistanceToResults(
  listings,
  userLocation
);
// Each item has new 'distance' field
```

### Frontend Map Integration
```javascript
// Find nearby properties with distance
const nearbyProperties = await axios.get('/api/listings/nearby', {
  params: {
    lat: 5.6037,
    lon: -0.1870,
    radiusKm: 10,
    type: 'property'
  },
  headers: { 'Authorization': `Bearer ${token}` }
});
// Use with Leaflet or Google Maps
```

---

## Error Handling Pattern

All endpoints follow this error response pattern:

```javascript
// Successful response
{
  success: true,
  message: 'Operation completed',
  data: { /* response data */ }
}

// Error response
{
  success: false,
  message: 'User not verified yet',
  errorCode: 'VERIFICATION_REQUIRED',
  statusCode: 403
}

// Catch errors
try {
  await axios.post('/api/payments/create', data);
} catch (error) {
  const status = error.response?.status; // 400, 403, 404, 500
  const message = error.response?.data?.message;
  const code = error.response?.data?.errorCode;
  handleError(code, message);
}
```

---

## Authentication Pattern

All requests require JWT token:

```javascript
// Set up axios interceptor
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Or manually include
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

---

## WebSocket Event Pattern

```javascript
// Emit (send from client)
socket.emit('send_message', {
  receiverId: 123,
  message: 'Hello!'
});

// Listen (receive from server)
socket.on('new_message', (message) => {
  console.log('Received:', message);
});

// Broadcast (server sends to specific user)
io.to(`user_${userId}`).emit('new_notification', notification);
```

---

## Common API Response Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (no token/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found (resource doesn't exist) |
| 409 | Conflict (duplicate data, already exists) |
| 429 | Too many requests (rate limited) |
| 500 | Server error |

---

## Testing Checklist

- [ ] All endpoints return correct status codes
- [ ] JWT authentication is enforced
- [ ] Role-based access works (user vs artisan vs admin)
- [ ] WebSocket connections establish successfully
- [ ] File uploads validate type and size
- [ ] Notifications emit in real-time
- [ ] Escrow funds properly held and released
- [ ] Distance calculations are accurate
- [ ] Duplicate prevention works (reviews, verifications)
- [ ] Error messages are descriptive

---

## Common Pitfalls

1. **Forgotten JWT**: Always include Authorization header
2. **Wrong Content-Type**: Use `multipart/form-data` for file uploads
3. **Missing userId/bookingId**: Most endpoints need context IDs
4. **WebSocket not connected**: Ensure Socket.io initialized before emitting
5. **Escrow not released**: Admin must explicitly release after service completion
6. **Wrong role**: Check user role for admin-only endpoints
7. **Token expired**: Refresh token before making requests
8. **Database not migrated**: Run schema initialization before testing

---

## Performance Tips

1. Pagination: Always use limit/offset on list endpoints
2. Caching: Store frequently accessed data (ratings, featured listings)
3. Indexes: Already included for foreign key lookups
4. Connection pooling: Use database connection pool
5. WebSocket: Use rooms to target specific users instead of broadcast
6. File uploads: Validate and compress images before storing

