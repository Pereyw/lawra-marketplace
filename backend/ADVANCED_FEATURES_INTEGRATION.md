# Advanced Features Integration Guide

This guide explains how to integrate all the new advanced features into your existing Express backend.

## Table of Contents
1. [Database Updates](#database-updates)
2. [Dependencies Installation](#dependencies-installation)
3. [Models Integration](#models-integration)
4. [Controllers Integration](#controllers-integration)
5. [Routes Integration](#routes-integration)
6. [WebSocket Setup](#websocket-setup)
7. [Environment Configuration](#environment-configuration)
8. [Testing](#testing)

---

## Database Updates

### Step 1: Initialize New Schema

The database schema has been extended with new tables:
- `verifications` - KYC verification data
- `disputes` - Dispute resolution
- `featured_listings` - Featured listings management  
- `escrow` - Escrow payment holding
- `analytics` - Metrics and analytics tracking

**Action:** Run the updated schema initialization in your database setup. The existing `schema.js` file includes all new tables with proper indexes.

```javascript
// In your app.js or migration file
const { initializeDatabase } = require('./database/schema');
await initializeDatabase(pool);
```

---

## Dependencies Installation

### Step 2: Install New Packages

```bash
npm install socket.io multer uuid
```

**New Dependencies:**
- **socket.io**: Real-time communication for chat and notifications
- **multer**: File upload handling for verification documents
- **uuid**: Generating unique identifiers

---

## Models Integration

### Step 3: Import and Initialize Models

Add to your `app.js`:

```javascript
// Import models
const Verification = require('./models/Verification');
const Review = require('./models/Review');
const Dispute = require('./models/Dispute');
const Escrow = require('./models/Escrow');
const FeaturedListings = require('./models/FeaturedListings');
const Notification = require('./models/Notification');
const Analytics = require('./models/Analytics');

// Initialize models
const verificationModel = new Verification(pool);
const reviewModel = new Review(pool);
const disputeModel = new Dispute(pool);
const escrowModel = new Escrow(pool);
const featuredListingsModel = new FeaturedListings(pool);
const notificationModel = new Notification(pool);
const analyticsModel = new Analytics(pool);
```

---

## Controllers Integration

### Step 4: Import and Initialize Controllers

Add to your `app.js`:

```javascript
// Import new controllers
const VerificationController = require('./controllers/VerificationController');
const ReviewController = require('./controllers/ReviewController');
const DisputeController = require('./controllers/DisputeController');
const PaymentController = require('./controllers/PaymentController');
const NotificationController = require('./controllers/NotificationController');
const FeaturedListingsController = require('./controllers/FeaturedListingsController');

// Import existing models (for controller dependencies)
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');

// Initialize existing models
const bookingModel = new Booking(pool);
const paymentModel = new Payment(pool);

// Initialize new controllers
const verificationController = new VerificationController(verificationModel, notificationModel);
const reviewController = new ReviewController(reviewModel, bookingModel, notificationModel);
const disputeController = new DisputeController(disputeModel, bookingModel, notificationModel);
const paymentController = new PaymentController(paymentModel, escrowModel, bookingModel, notificationModel);
const notificationController = new NotificationController(notificationModel);
const featuredListingsController = new FeaturedListingsController(
  featuredListingsModel,
  paymentModel,
  notificationModel
);
```

---

## Routes Integration

### Step 5: Register Advanced Features Routes

In your `app.js`:

```javascript
// Import advanced features routes
const advancedFeaturesRoutes = require('./routes/advanced-features');

// Express setup...
const app = express();

// ... existing middleware and routes ...

// Register advanced features routes
app.use('/api', advancedFeaturesRoutes(
  verificationController,
  reviewController,
  disputeController,
  paymentController,
  notificationController,
  featuredListingsController
));

// ... rest of your app.js...
```

### Available Endpoints

#### Verification (KYC)
- `POST /api/verifications/submit` - Submit verification
- `GET /api/verifications/status` - Get verification status
- `GET /api/admin/verifications/pending` - List pending (admin)
- `POST /api/admin/verifications/:id/approve` - Approve (admin)
- `POST /api/admin/verifications/:id/reject` - Reject (admin)

#### Reviews & Ratings
- `POST /api/reviews` - Create review
- `GET /api/reviews/user/:userId` - Get user reviews
- `GET /api/reviews/property/:propertyId` - Get property reviews
- `GET /api/reviews/rating/:userId` - Get average rating
- `PUT /api/reviews/:reviewId` - Update review
- `DELETE /api/reviews/:reviewId` - Delete review

#### Disputes
- `POST /api/disputes` - Create dispute
- `GET /api/disputes/my-disputes` - Get my disputes
- `GET /api/admin/disputes` - List all disputes (admin)
- `PUT /api/admin/disputes/:id/status` - Update status (admin)
- `POST /api/admin/disputes/:id/resolve` - Resolve (admin)

#### Payments & Escrow
- `POST /api/payments/create` - Create payment with escrow
- `POST /api/payments/:id/verify` - Verify payment
- `GET /api/payments/my-payments` - Get my payments
- `POST /api/payments/:id/refund` - Refund payment
- `POST /api/escrow/:id/release` - Release escrow (admin)
- `POST /api/escrow/:id/refund` - Refund escrow (admin)

#### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

#### Featured Listings
- `GET /api/listings/featured/:type` - Get featured listings
- `POST /api/listings/:type/:id/feature` - Create featured listing
- `GET /api/listings/featured/:id/extend` - Extend featuring period

---

## WebSocket Setup

### Step 6: Initialize Socket.io

In your `app.js`:

```javascript
const http = require('http');
const socketIO = require('socket.io');
const WebSocketHandler = require('./services/WebSocketHandler');

// Create HTTP server (required for Socket.io)
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Import Message model for WebSocket
const Message = require('./models/Message');
const messageModel = new Message(pool);

// Initialize WebSocket handler
const wsHandler = new WebSocketHandler(io, messageModel, notificationModel);
wsHandler.initialize();

// Export for use in routes/controllers
app.set('io', io);
app.set('wsHandler', wsHandler);

// Start server on HTTP port instead of HTTPS
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
```

### WebSocket Events

#### Client Events (sent from frontend):
- `user_online` - User comes online
- `send_message` - Send a message
- `mark_message_read` - Mark message as read
- `get_messages` - Fetch message history
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `subscribe_booking_updates` - Subscribe to booking updates
- `booking_update` - Broadcast booking update
- `payment_update` - Broadcast payment update

#### Server Events (broadcast from server):
- `new_message` - New message received
- `message_sent` - Message delivery confirmation
- `message_read` - Message marked as read
- `messages_history` - Message history response
- `typing_indicator` - User typing indicator
- `booking_status_changed` - Booking status update
- `payment_status_changed` - Payment status update
- `user_status_change` - User online/offline status

---

## Environment Configuration

### Step 7: Update .env file

```env
# Existing
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret
PORT=5000

# New
FRONTEND_URL=http://localhost:3000
FILE_UPLOAD_DIR=./uploads/verifications
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf

# Payment gateway (mock or real)
PAYMENT_GATEWAY_URL=https://api.payment-provider.com
PAYMENT_API_KEY=your_api_key

# SMS/Email (optional)
SMS_API_KEY=your_sms_key
EMAIL_SERVICE=smtp_or_api
```

---

## Frontend/Client Integration

### Step 8: Frontend Setup (React/Next.js)

#### Socket.io Client Connection

```javascript
// lib/socket.ts or hooks/useSocket.ts
import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  auth: {
    token: localStorage.getItem('token')
  }
});

// Connect to user room
socket.emit('user_online', userId);

// Listen for messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
  // Update UI
});

// Send message
socket.emit('send_message', {
  receiverId: 123,
  message: 'Hello!',
  senderName: 'John'
});
```

#### Verification Component

```jsx
// components/Verification.tsx
import { useState } from 'react';
import axios from 'axios';

export function VerificationComponent() {
  const [idType, setIdType] = useState('ghana_card');
  const [idNumber, setIdNumber] = useState('');
  const [document, setDocument] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('idType', idType);
    formData.append('idNumber', idNumber);
    formData.append('document', document);

    try {
      const response = await axios.post('/api/verifications/submit', formData);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={idType} onChange={(e) => setIdType(e.target.value)}>
        <option value="ghana_card">Ghana Card</option>
        <option value="passport">Passport</option>
        <option value="drivers_license">Driver's License</option>
      </select>
      <input
        type="text"
        value={idNumber}
        onChange={(e) => setIdNumber(e.target.value)}
        placeholder="ID Number"
      />
      <input
        type="file"
        onChange={(e) => setDocument(e.target.files[0])}
        accept=".pdf,.jpg,.jpeg,.png"
      />
      <button type="submit">Submit Verification</button>
    </form>
  );
}
```

---

## Testing

### Step 9: Test API Endpoints

#### Test Verification
```bash
curl -X POST http://localhost:5000/api/verifications/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "idType=ghana_card" \
  -F "idNumber=GHA123456789" \
  -F "document=@/path/to/document.pdf"
```

#### Test Review Creation
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "revieweeId": 2,
    "bookingId": 1,
    "rating": 5,
    "title": "Great property!",
    "comment": "Very clean and well-maintained."
  }'
```

#### Test WebSocket Connection
```javascript
// In browser console
const socket = io('http://localhost:5000');
socket.emit('user_online', 1);
socket.on('new_message', (msg) => console.log('Message:', msg));
```

---

## Troubleshooting

### Common Issues

1. **Port already in use**: Change PORT in .env
2. **Socket.io CORS errors**: Check FRONTEND_URL in .env
3. **Database connection**: Verify DATABASE_URL in .env
4. **JWT errors**: Ensure JWT_SECRET matches between frontend and backend
5. **File upload errors**: Check FILE_UPLOAD_DIR permissions and MAX_FILE_SIZE

### Monitor Logs

```bash
# In development
npm run dev  # Uses nodemon for auto-restart

# Production
npm start
```

---

## Performance Considerations

1. **Database Indexes**: Already included in schema for common queries
2. **WebSocket Scalability**: Consider Redis adapter for multiple server instances
3. **File Storage**: Implement CDN for document uploads
4. **Caching**: Add Redis for frequently accessed data
5. **Rate Limiting**: Already implemented on sensitive endpoints

---

## Security Best Practices

1. ✅ All endpoints require JWT authentication (except public browse)
2. ✅ Input validation on all controllers
3. ✅ Sensitive data not exposed in responses
4. ✅ File uploads validated by type and size
5. ✅ Role-based access control for admin endpoints
6. ✅ SQL injection prevention through parameterized queries
7. ✅ CORS properly configured

---

## Next Steps

1. Install dependencies: `npm install`
2. Update database schema
3. Integrate models and controllers
4. Register routes in app.js
5. Setup Socket.io
6. Configure environment variables
7. Test endpoints
8. Deploy to production

---

## Support

For detailed implementation questions, refer to:
- [Express Documentation](https://expressjs.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

