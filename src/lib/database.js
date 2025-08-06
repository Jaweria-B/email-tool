import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dbPath = path.join(process.cwd(), 'data', 'emailcraft.db');
const schemaPath = path.join(process.cwd(), 'schema.sql');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Initialize schema
const initializeSchema = () => {
  const createTables = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      company TEXT,
      job_title TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS email_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      email_subject TEXT,
      email_body TEXT,
      recipient TEXT,
      tone TEXT,
      ai_provider TEXT,
      purpose TEXT,
      priority TEXT,
      status TEXT DEFAULT 'generated',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      provider TEXT NOT NULL,
      api_key TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(user_id, provider)
    );
  `;

  try {
    db.exec(createTables);
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  }
};

// Initialize the schema
initializeSchema();

// User operations
export const userDb = {
  // Create user
  create: (userData) => {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, company, job_title, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(userData.name, userData.email, userData.company, userData.job_title, 'active');
  },

  // Find user by email
  findByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  // Find user by ID
  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  // Update user
  update: (id, userData) => {
    const stmt = db.prepare(`
      UPDATE users 
      SET name = ?, company = ?, job_title = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(userData.name, userData.company, userData.job_title, id);
  }
};

// Session operations
export const sessionDb = {
  // Create session
  create: (userId) => {
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const stmt = db.prepare(`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (?, ?, ?)
    `);
    
    stmt.run(userId, sessionToken, expiresAt.toISOString());
    return sessionToken;
  },

  // Find valid session
  findValid: (sessionToken) => {
    const stmt = db.prepare(`
      SELECT us.*, u.* FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.session_token = ? AND us.expires_at > datetime('now')
    `);
    return stmt.get(sessionToken);
  },

  // Delete session
  delete: (sessionToken) => {
    const stmt = db.prepare('DELETE FROM user_sessions WHERE session_token = ?');
    return stmt.run(sessionToken);
  },

  // Clean expired sessions
  cleanExpired: () => {
    const stmt = db.prepare('DELETE FROM user_sessions WHERE expires_at <= datetime("now")');
    return stmt.run();
  }
};

// Email activity operations
export const emailActivityDb = {
  // Log email activity
  create: (userId, emailData) => {
    const stmt = db.prepare(`
      INSERT INTO email_activity 
      (user_id, email_subject, email_body, recipient, tone, ai_provider, purpose, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      userId,
      emailData.subject,
      emailData.body,
      emailData.recipient,
      emailData.tone,
      emailData.ai_provider,
      emailData.purpose,
      emailData.priority,
      emailData.status || 'generated'
    );
  },

  // Get user's email history
  getByUser: (userId, limit = 50) => {
    const stmt = db.prepare(`
      SELECT * FROM email_activity 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(userId, limit);
  },

  // Update email status
  updateStatus: (id, status) => {
    const stmt = db.prepare('UPDATE email_activity SET status = ? WHERE id = ?');
    return stmt.run(status, id);
  }
};

// API Keys operations (basic - should be encrypted in production)
export const apiKeysDb = {
  // Save API key
  upsert: (userId, provider, apiKey) => {
    const stmt = db.prepare(`
      INSERT INTO user_api_keys (user_id, provider, api_key)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, provider) 
      DO UPDATE SET api_key = ?, updated_at = CURRENT_TIMESTAMP
    `);
    return stmt.run(userId, provider, apiKey, apiKey);
  },

  // Get user's API keys
  getByUser: (userId) => {
    const stmt = db.prepare('SELECT provider, api_key FROM user_api_keys WHERE user_id = ?');
    const results = stmt.all(userId);
    
    // Convert to object format
    const apiKeys = {};
    results.forEach(row => {
      apiKeys[row.provider] = row.api_key;
    });
    return apiKeys;
  },

  // Delete API key
  delete: (userId, provider) => {
    const stmt = db.prepare('DELETE FROM user_api_keys WHERE user_id = ? AND provider = ?');
    return stmt.run(userId, provider);
  }
};

export default db;