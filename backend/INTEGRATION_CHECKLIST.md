# Integration Checklist

Quick checklist for integrating advanced features into your existing app.js

## Pre-Integration Setup (5 minutes)

- [ ] Install dependencies: `npm install socket.io@^4.7.2 multer@^1.4.5-lts.1 uuid@^9.0.0`
- [ ] Backup current app.js and package.json
- [ ] Read ADVANCED_FEATURES_INTEGRATION.md sections 1-2
- [ ] Verify PostgreSQL is running
- [ ] Check database connection string in .env

---

## Database Setup (10 minutes)

- [ ] Run new schema initialization: `node scripts/init-advanced-schema.js`
- [ ] Verify 8 new tables created:
  - [ ] verifications
  - [ ] disputes
  - [ ] featured_listings
  - [ ] analytics
  - [ ] escrow
- [ ] Verify 3 tables enhanced:
  - [ ] bookings (+ scheduled_start_time, scheduled_end_time)
  - [ ] payments (escrow fields)
- [ ] Check database for indexes
- [ ] Backup database

---

## Environment Configuration (5 minutes)

Add to your .env file:

```env
# Real-time communication
FRONTEND_URL=http://localhost:3000

# File uploads
FILE_UPLOAD_DIR=./uploads/verifications
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf

# Payment (optional - for now use mock)
PAYMENT_GATEWAY_URL=https://api.payment-provider.com
PAYMENT_API_KEY=your_api_key_here
```

- [ ] Added FRONTEND_URL
- [ ] Added FILE_UPLOAD_DIR
- [ ] Added MAX_FILE_SIZE
- [ ] Added ALLOWED_FILE_TYPES
- [ ] Created ./uploads/verifications directory

---

## Code Integration (30 minutes)

### Step 1: Import Models (5 min)

Add to app.js after database connection:

```javascript
// Import new models
const Verification = require('./models/Verification');
const Review = require('./models/Review');
const Dispute = require('./models/Dispute');
const Escrow = require('./models/Escrow');
const FeaturedListings = require('./models/FeaturedListings');
const Notification = require('./models/Notification');
const Analytics = require('./models/Analytics');
```

- [ ] Added all 7 model imports
- [ ] Verified files exist at correct paths
- [ ] No import errors in console

### Step 2: Initialize Models (5 min)

Add after model imports:

```javascript
// Initialize models
const verificationModel = new Verification(pool);
const reviewModel = new Review(pool);
const disputeModel = new Dispute(pool);
const escrowModel = new Escrow(pool);
const featuredListingsModel = new FeaturedListings(pool);
const notificationModel = new Notification(pool);
const analyticsModel = new Analytics(pool);
```

- [ ] Added all model initializations
- [ ] All models use same 'pool' connection

### Step 3: Import Controllers (5 min)

Add after model initialization:

```javascript
// Import existing models needed by controllers
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');

// Import controllers
const VerificationController = require('./controllers/VerificationController');
const ReviewController = require('./controllers/ReviewController');
const DisputeController = require('./controllers/DisputeController');
const PaymentController = require('./controllers/PaymentController');
const NotificationController = require('./controllers/NotificationController');
const FeaturedListingsController = require('./controllers/FeaturedListingsController');
```

- [ ] Added controller imports
- [ ] Added Booking and Payment imports
- [ ] Verified all files exist

### Step 4: Initialize Controllers (5 min)

Add after controller imports:

```javascript
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

- [ ] Added all controller initializations
- [ ] Controllers receive correct model dependencies
- [ ] No initialization errors

### Step 5: Register Routes (5 min)

After Express app setup (after `app.use('/api', existingRoutes)`), add:

```javascript
// Import advanced features routes
const advancedFeaturesRoutes = require('./routes/advanced-features');

// Register routes (after existing routes)
app.use('/api', advancedFeaturesRoutes(
  verificationController,
  reviewController,
  disputeController,
  paymentController,
  notificationController,
  featuredListingsController
));
```

- [ ] Added advanced-features import
- [ ] Registered routes with app.use
- [ ] Routes registered AFTER existing routes
- [ ] All controller parameters included

---

## WebSocket Setup (15 minutes)

### Important: Switch from https to http

Replace your current server setup:

```javascript
// OLD (if using https):
// const https = require('https');
// https.createServer({...}, app).listen(...)

// NEW (for Socket.io):
const http = require('http');
const socketIO = require('socket.io');
const WebSocketHandler = require('./services/WebSocketHandler');

// Create HTTP server (Socket.io requirement)
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Import Message model
const Message = require('./models/Message');
const messageModel = new Message(pool);

// Initialize WebSocket handler
const wsHandler = new WebSocketHandler(io, messageModel, notificationModel);
wsHandler.initialize();

// Make io available to routes/controllers
app.set('io', io);
app.set('wsHandler', wsHandler);

// Listen on HTTP port instead of HTTPS
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [ ] Switched from https to http
- [ ] Changed to http.createServer
- [ ] Socket.io initialized with CORS
- [ ] WebSocketHandler initialized
- [ ] io and wsHandler added to app
- [ ] Server listens with server.listen (not app.listen)
- [ ] PORT uses http instead of https

---

## File Upload Setup (10 minutes)

Add multer middleware for file uploads:

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directory if it doesn't exist
const uploadDir = process.env.FILE_UPLOAD_DIR || './uploads/verifications';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf').split(',');
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${fileExtension}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 5242880) // 5MB default
  }
});

// Make upload available globally
app.locals.upload = upload;
```

- [ ] Added multer configuration
- [ ] Created upload directory
- [ ] File filter validates types
- [ ] File size limits enforced
- [ ] Upload middleware accessible

---

## Testing (20 minutes)

### Test API Endpoints

1. **Test Verification Endpoint**
   ```bash
   curl -X GET http://localhost:5000/api/verifications/status \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   - [ ] Returns 200 or 401 (without token)
   - [ ] Correct JWT verification

2. **Test Review Endpoint**
   ```bash
   curl -X GET http://localhost:5000/api/reviews/user/1 \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   - [ ] Returns 200 with review data or empty array
   - [ ] Authentication working

3. **Test Notification Endpoint**
   ```bash
   curl -X GET http://localhost:5000/api/notifications \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   - [ ] Returns 200 with notifications
   - [ ] Database queries working

4. **Test WebSocket Connection**
   ```javascript
   // In browser console
   const socket = io('http://localhost:5000');
   socket.on('connect', () => console.log('Connected'));
   socket.emit('user_online', userId);
   socket.on('new_message', (msg) => console.log('Message:', msg));
   ```
   - [ ] WebSocket connects successfully
   - [ ] No CORS errors
   - [ ] Events emit/receive working

### Test Authentication

- [ ] Request without token gets 401
- [ ] Request with invalid token gets 401
- [ ] Request with valid token gets 200

### Test Authorization

- [ ] Admin endpoints reject non-admin users (403)
- [ ] User endpoints reject wrong user (403)
- [ ] Public endpoints work for all

---

## Verification (10 minutes)

### Verify All Endpoints Available

Check that all 42 endpoints are registered:

```bash
# From app.js code or API documentation
# Should see routes for:
# - /api/verifications/* (6 routes)
# - /api/reviews/* (8 routes)
# - /api/disputes/* (8 routes)
# - /api/payments/* (10 routes)
# - /api/notifications/* (7 routes)
# - /api/listings/featured/* (6 routes)
```

- [ ] Verification routes present (6)
- [ ] Review routes present (8)
- [ ] Dispute routes present (8)
- [ ] Payment routes present (10)
- [ ] Notification routes present (7)
- [ ] Featured listings routes present (6)

### Verify Database

```bash
# Connect to PostgreSQL
psql -d your_database -U your_user

# List all tables
\dt

# Verify new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'v%';
```

- [ ] 8 new tables present
- [ ] 3 tables enhanced
- [ ] All indexes created
- [ ] No errors in schema

### Verify Configuration

- [ ] FRONTEND_URL is set
- [ ] FILE_UPLOAD_DIR exists with write permissions
- [ ] MAX_FILE_SIZE is reasonable
- [ ] Socket.io CORS not blocking frontend

---

## Logs to Check

After starting server, check for:

✅ All good:
```
✓ Verification model initialized
✓ Review model initialized
✓ Dispute model initialized
✓ Escrow model initialized
✓ FeaturedListings model initialized
✓ Notification model initialized
✓ Analytics model initialized
✓ Advanced features routes registered
✓ WebSocket handler initialized
✓ Server listening on port 5000
```

❌ Watch for errors:
```
✗ Cannot find module (missing file)
✗ Error: pool is not defined (initialization order)
✗ Cannot set property 'io' of undefined (app not ready)
✗ ECONNREFUSED (database not running)
```

---

## Troubleshooting

### Error: "Cannot find module './models/Verification'"
- [ ] Check file exists at backend/models/Verification.js
- [ ] Check import path is correct
- [ ] Check file is not corrupted

### Error: "pool is not defined"
- [ ] Ensure models are initialized AFTER database connection
- [ ] Verify pool is passed to all model constructors
- [ ] Check pool variable name matches

### Error: "CORS error from Socket.io"
- [ ] Update FRONTEND_URL in .env
- [ ] Clear browser cache and refresh
- [ ] Check frontend URL matches exactly

### Error: "Cannot POST /api/verifications/submit"
- [ ] Check routes registered with app.use
- [ ] Verify advanced-features.js routes file exists
- [ ] Check controllers are passed correctly to router

### Error: "File upload not working"
- [ ] Check ./uploads/verifications directory exists
- [ ] Check directory has write permissions
- [ ] Verify multer middleware configured
- [ ] Check file size under MAX_FILE_SIZE

---

## Performance Check

Before going live:

- [ ] Endpoints respond in <100ms (locally)
- [ ] WebSocket connects in <1 second
- [ ] File upload completes in <5 seconds
- [ ] Database queries show in console
- [ ] No memory leaks (check server uptime)

---

## Security Check

Before deploying:

- [ ] JWT_SECRET is strong and random
- [ ] No console.log of sensitive data
- [ ] All user inputs validated
- [ ] Authorization checks on admin endpoints
- [ ] File uploads validated and stored securely
- [ ] FRONTEND_URL matches production domain
- [ ] No hardcoded API keys
- [ ] SSL/HTTPS enabled in production

---

## Final Status

When complete, you'll have:

✅ 42 REST API endpoints live
✅ Real-time WebSocket communication
✅ Secure JWT authentication
✅ Role-based access control
✅ File upload handling
✅ Database tables with indexes
✅ Production-ready error handling
✅ Full API documentation

---

## Next Phase: Frontend

Once backend is integrated and tested:

1. Frontend files to create:
   - [ ] components/Verification.tsx
   - [ ] components/ReviewForm.tsx
   - [ ] components/ChatInterface.tsx
   - [ ] components/NotificationsPanel.tsx
   - [ ] pages/admin/Analytics.tsx
   - [ ] pages/admin/Disputes.tsx
   - [ ] hooks/useSocket.ts
   - [ ] services/api.ts

2. Frontend setup needed:
   - [ ] socket.io-client installation
   - [ ] WebSocket connection setup
   - [ ] Redux/Context for state management
   - [ ] Form validation library
   - [ ] Real-time notification UI

---

## Quick Help

**Reference Documents:**
- Detailed setup → `ADVANCED_FEATURES_INTEGRATION.md`
- All files → `FILE_MANIFEST.md`
- Code examples → `QUICK_REFERENCE.md`
- Summary → `COMPLETION_REPORT.md`

**Test Endpoints:**
See QUICK_REFERENCE.md section "Quick Reference Guide" for curl/code examples

**Stuck?**
1. Check ADVANCED_FEATURES_INTEGRATION.md
2. Review the specific file's JSDoc comments
3. Check database schema: database/schema.js
4. Look at similar endpoint implementations

---

## Estimated Timeline

- Setup & Integration: **1-2 hours**
- Testing & Verification: **1-2 hours**
- Bug fixes & tuning: **1-2 hours**
- Frontend development: **4-8 hours**

**Total to production: ~8-12 hours**

---

Done! Check next steps in ADVANCED_FEATURES_INTEGRATION.md

