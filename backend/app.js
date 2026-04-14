require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Import models, services, controllers
const User = require('./models/User');
const Property = require('./models/Property');
const Artisan = require('./models/Artisan');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Message = require('./models/Message');
const AuthService = require('./services/AuthService');
const PropertyService = require('./services/PropertyService');
const ArtisanService = require('./services/ArtisanService');
const ServiceProviderService = require('./services/ServiceProviderService');
const BookingService = require('./services/BookingService');
const MessageService = require('./services/MessageService');
const AuthController = require('./controllers/AuthController');
const PropertyController = require('./controllers/PropertyController');
const ArtisanController = require('./controllers/ArtisanController');
const ServiceProviderController = require('./controllers/ServiceProviderController');
const BookingController = require('./controllers/BookingController');
const MessageController = require('./controllers/MessageController');
const { errorHandler } = require('./middleware/auth');
const apiRoutes = require('./routes/api');
const { initializeDatabase } = require('./database/schema');

// Initialize Express app
const app = express();

// ============ MIDDLEWARE ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============ DATABASE CONNECTION ============
const db = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'lawra_marketplace',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
db.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// ============ INITIALIZE DEPENDENCIES ============
// Models
const userModel = new User(db);
const propertyModel = new Property(db);
const artisanModel = new Artisan(db);
const serviceModel = new Service(db);
const bookingModel = new Booking(db);
const messageModel = new Message(db);

// Services
const authService = new AuthService(userModel);
const propertyService = new PropertyService(propertyModel);
const artisanService = new ArtisanService(artisanModel);
const serviceProviderService = new ServiceProviderService(serviceModel);
const bookingService = new BookingService(bookingModel, propertyModel, serviceModel);
const messageService = new MessageService(messageModel, userModel);

// Controllers
const authController = new AuthController(authService);
const propertyController = new PropertyController(propertyService);
const artisanController = new ArtisanController(artisanService);
const serviceProviderController = new ServiceProviderController(serviceProviderService);
const bookingController = new BookingController(bookingService);
const messageController = new MessageController(messageService);

// ============ ROUTES ============
app.use('/api', apiRoutes(authController, propertyController, artisanController, serviceProviderController, bookingController, messageController, authService));

// ============ ERROR HANDLING ============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

app.use(errorHandler);

// ============ SERVER STARTUP ============
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    const result = await db.query('SELECT NOW()');
    console.log('✓ Database connected:', result.rows[0]);

    // Initialize database schema
    await initializeDatabase(db);

    // Start server
    app.listen(PORT, () => {
      console.log(`
✓ Server running on http://localhost:${PORT}
✓ Environment: ${process.env.NODE_ENV || 'development'}
✓ API Base URL: http://localhost:${PORT}/api
      `);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await db.end();
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { app, db };
