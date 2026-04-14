/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */
class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const { name, email, phone, password, role } = req.body;

      const { user, token } = await this.authService.register({
        name,
        email,
        phone,
        password,
        role
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password required'
        });
      }

      const { user, token } = await this.authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Refresh authentication token
   * POST /api/auth/refresh
   */
  async refreshToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token required'
        });
      }

      const { token: newToken } = await this.authService.refreshToken(token);

      res.status(200).json({
        success: true,
        message: 'Token refreshed',
        data: {
          token: newToken
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async getProfile(req, res) {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      // In JWT, logout is handled client-side by removing token
      // Server can maintain a blacklist if needed
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AuthController;
