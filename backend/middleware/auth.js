/**
 * Authentication Middleware
 * Handles token verification and role-based access control
 */

/**
 * Verify JWT token and attach user to request
 * @param {AuthService} authService - Authentication service instance
 */
const verifyToken = (authService) => (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Token verification failed'
    });
  }
};

/**
 * Authorize specific user roles
 * @param {...string} roles - Allowed roles
 */
const authorizeRole = (...roles) => (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Required role(s): ${roles.join(', ')}`,
        userRole: req.user.role
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

/**
 * Check if user is the owner of the resource
 * Useful for property ownership verification
 */
const isOwner = (req, res, next) => {
  try {
    const resourceOwnerId = parseInt(req.body.landlord_id || req.params.landlord_id);

    if (!resourceOwnerId) {
      return next();
    }

    if (req.user.id !== resourceOwnerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ownership verification failed'
    });
  }
};

/**
 * Optional token verification (doesn't fail if token missing)
 * @param {AuthService} authService - Authentication service instance
 */
const optionalToken = (authService) => (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = authService.verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Token invalid but optional, continue
    next();
  }
};

/**
 * Rate limiting middleware (basic implementation)
 * @param {number} maxRequests - Max requests per window
 * @param {number} windowMs - Time window in milliseconds
 */
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const userRequests = requests.get(key) || [];

    // Clean old requests
    const recentRequests = userRequests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }

    recentRequests.push(now);
    requests.set(key, recentRequests);
    next();
  };
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = {
  verifyToken,
  authorizeRole,
  isOwner,
  optionalToken,
  rateLimit,
  errorHandler
};
