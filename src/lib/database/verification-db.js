// lib/database/verification-db.js
import { db } from './index.js';

export const verificationDb = {
  // Create verification code
  async create(email, code, expiresInMinutes = 15) {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    
    const stmt = db.prepare(`
      INSERT INTO email_verification_codes (email, code, expires_at)
      VALUES (?, ?, ?)
    `);
    
    return stmt.run(email, code, expiresAt.toISOString());
  },

  // Find valid verification code
  async findValidCode(email, code) {
    const stmt = db.prepare(`
      SELECT * FROM email_verification_codes 
      WHERE email = ? AND code = ? AND expires_at > datetime('now') AND used = FALSE
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    return stmt.get(email, code);
  },

  // Mark code as used
  async markAsUsed(id) {
    const stmt = db.prepare(`
      UPDATE email_verification_codes 
      SET used = TRUE, updated_at = datetime('now')
      WHERE id = ?
    `);
    
    return stmt.run(id);
  },

  // Increment attempts
  async incrementAttempts(email, code) {
    const stmt = db.prepare(`
      UPDATE email_verification_codes 
      SET attempts = attempts + 1
      WHERE email = ? AND code = ?
    `);
    
    return stmt.run(email, code);
  },

  // Clean up expired codes
  async cleanupExpired() {
    const stmt = db.prepare(`
      DELETE FROM email_verification_codes 
      WHERE expires_at < datetime('now') OR used = TRUE
    `);
    
    return stmt.run();
  },

  // Check if too many attempts
  async getTodayAttempts(email) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM email_verification_codes 
      WHERE email = ? AND created_at > datetime('now', '-1 day')
    `);
    
    const result = stmt.get(email);
    return result?.count || 0;
  }
};

// Update userDb to include email verification
export const userDbUpdated = {
  ...userDb, // Spread existing userDb methods

  // Create user with pending status
  async createPending(userData) {
    const { name, email, company, job_title } = userData;
    const stmt = db.prepare(`
      INSERT INTO users (name, email, company, job_title, status, email_verified)
      VALUES (?, ?, ?, ?, 'pending', FALSE)
    `);
    
    return stmt.run(name, email, company || null, job_title || null);
  },

  // Verify user email and activate account
  async verifyEmail(email) {
    const stmt = db.prepare(`
      UPDATE users 
      SET email_verified = TRUE, status = 'active', updated_at = datetime('now')
      WHERE email = ?
    `);
    
    return stmt.run(email);
  },

  // Find user by email regardless of verification status
  async findByEmailAny(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }
};