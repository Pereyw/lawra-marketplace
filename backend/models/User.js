const bcrypt = require('bcryptjs');

/**
 * User Model
 * Handles user database operations: create, retrieve, verify credentials
 */
class User {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create new user
   * @param {Object} userData - User data (name, email, phone, password, role)
   * @returns {Promise<Object>} Created user object
   */
  async create(userData) {
    const { name, email, phone, password, role } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (name, email, phone, password, role, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, name, email, phone, role, created_at
    `;
    
    const result = await this.db.query(query, [
      name, email, phone, hashedPassword, role
    ]);
    
    return result.rows[0];
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User object with password hash
   */
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.db.query(query, [email]);
    return result.rows[0];
  }

  /**
   * Find user by ID (without password)
   * @param {number} id - User ID
   * @returns {Promise<Object>} User object
   */
  async findById(id) {
    const query = 'SELECT id, name, email, phone, role FROM users WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Verify plain text password against hash
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from DB
   * @returns {Promise<boolean>} Password match result
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Check if email exists
   * @param {string} email - User email
   * @returns {Promise<boolean>} Email existence
   */
  async emailExists(email) {
    const result = await this.db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    return result.rows.length > 0;
  }

  /**
   * Update user profile
   * @param {number} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(id, updateData) {
    const { name, phone } = updateData;
    const query = `
      UPDATE users
      SET name = COALESCE($1, name), phone = COALESCE($2, phone), updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, email, phone, role
    `;
    
    const result = await this.db.query(query, [name, phone, id]);
    return result.rows[0];
  }
}

module.exports = User;
