const jwt = require('jsonwebtoken');

/**
 * Authentication Service
 * Handles registration, login, token generation and validation
 */
class AuthService {
  constructor(userModel) {
    this.userModel = userModel;
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.JWT_EXPIRY = '24h';
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User and authentication token
   */
  async register(userData) {
    try {
      this.validateUserInput(userData);

      const existingUser = await this.userModel.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      const user = await this.userModel.create(userData);
      const token = this.generateToken(user);

      return { 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token 
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User and token
   */
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password required');
      }

      const user = await this.userModel.findByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await this.userModel.verifyPassword(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      const token = this.generateToken(user);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate JWT token
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRY }
    );
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      }
      throw new Error('Invalid token');
    }
  }

  /**
   * Validate user registration input
   * @param {Object} userData - User data to validate
   * @throws {Error} Validation error
   */
  validateUserInput(userData) {
    const { name, email, phone, password, role } = userData;

    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email address required');
    }

    if (!phone || !this.isValidPhone(phone)) {
      throw new Error('Valid phone number required (Ghana format: 024xxxxxxxx or +234...)');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const validRoles = ['user', 'landlord', 'artisan', 'service_provider'];
    if (!role || !validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Email validity
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Validate phone number (Ghana/Africa format)
   * @param {string} phone - Phone to validate
   * @returns {boolean} Phone validity
   */
  isValidPhone(phone) {
    // Accepts: +233..., 233..., 024-029, or 0701-0799
    const cleaned = phone.replace(/[\s-]/g, '');
    // Allow various Ghana/Africa phone formats
    return /^(\+233|233|0)[0-9]{8,10}$/.test(cleaned) || /^[0-9]{10,13}$/.test(cleaned);
  }

  /**
   * Refresh authentication token
   * @param {string} token - Current token
   * @returns {Object} New token
   */
  async refreshToken(token) {
    try {
      const decoded = this.verifyToken(token);
      const user = await this.userModel.findById(decoded.id);
      
      if (!user) {
        throw new Error('User not found');
      }

      const newToken = this.generateToken(user);
      return { token: newToken };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;
