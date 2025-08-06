// lib/database.js
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

// Initialize connection
const sql = neon(process.env.DATABASE_URL);

// Initialize database tables
const initializeSchema = async () => {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        company TEXT,
        job_title TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create user_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        session_token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    // Create email_activity table
    await sql`
      CREATE TABLE IF NOT EXISTS email_activity (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        email_subject TEXT,
        email_body TEXT,
        recipient TEXT,
        tone TEXT,
        ai_provider TEXT,
        purpose TEXT,
        priority TEXT,
        status TEXT DEFAULT 'generated',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    // Create user_api_keys table
    await sql`
      CREATE TABLE IF NOT EXISTS user_api_keys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        provider TEXT NOT NULL,
        api_key TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, provider)
      )
    `;

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
};

// Comment this out for now - run manually first
// initializeSchema();

// User operations
export const userDb = {
  // Create user
  create: async (userData) => {
    const result = await sql`
      INSERT INTO users (name, email, company, job_title, status)
      VALUES (${userData.name}, ${userData.email}, ${userData.company}, ${userData.job_title}, 'active')
      RETURNING id
    `;
    return { lastInsertRowid: result[0].id };
  },

  // Find user by email
  findByEmail: async (email) => {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    return result[0] || null;
  },

  // Find user by ID
  findById: async (id) => {
    const result = await sql`SELECT * FROM users WHERE id = ${id}`;
    return result[0] || null;
  },

  // Update user
  update: async (id, userData) => {
    const result = await sql`
      UPDATE users 
      SET name = ${userData.name}, company = ${userData.company}, job_title = ${userData.job_title}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    return result;
  }
};

// Session operations
export const sessionDb = {
  // Create session
  create: async (userId) => {
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await sql`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (${userId}, ${sessionToken}, ${expiresAt.toISOString()})
    `;
    
    return sessionToken;
  },

  // Find valid session
  findValid: async (sessionToken) => {
    const result = await sql`
      SELECT us.*, u.* FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.session_token = ${sessionToken} AND us.expires_at > NOW()
    `;
    return result[0] || null;
  },

  // Delete session
  delete: async (sessionToken) => {
    const result = await sql`DELETE FROM user_sessions WHERE session_token = ${sessionToken}`;
    return result;
  },

  // Clean expired sessions
  cleanExpired: async () => {
    const result = await sql`DELETE FROM user_sessions WHERE expires_at <= NOW()`;
    return result;
  }
};

// Email activity operations
export const emailActivityDb = {
  // Log email activity
  create: async (userId, emailData) => {
    const result = await sql`
      INSERT INTO email_activity 
      (user_id, email_subject, email_body, recipient, tone, ai_provider, purpose, priority, status)
      VALUES (${userId}, ${emailData.subject}, ${emailData.body}, ${emailData.recipient}, ${emailData.tone}, ${emailData.ai_provider}, ${emailData.purpose}, ${emailData.priority}, ${emailData.status || 'generated'})
    `;
    return result;
  },

  // Get user's email history
  getByUser: async (userId, limit = 50) => {
    const result = await sql`
      SELECT * FROM email_activity 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    return result;
  },

  // Update email status
  updateStatus: async (id, status) => {
    const result = await sql`UPDATE email_activity SET status = ${status} WHERE id = ${id}`;
    return result;
  }
};

// API Keys operations
export const apiKeysDb = {
  // Save API key (upsert)
  upsert: async (userId, provider, apiKey) => {
    // Check if exists first
    const existing = await sql`
      SELECT id FROM user_api_keys 
      WHERE user_id = ${userId} AND provider = ${provider}
    `;
    
    if (existing.length > 0) {
      // Update existing
      await sql`
        UPDATE user_api_keys 
        SET api_key = ${apiKey}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} AND provider = ${provider}
      `;
    } else {
      // Insert new
      await sql`
        INSERT INTO user_api_keys (user_id, provider, api_key)
        VALUES (${userId}, ${provider}, ${apiKey})
      `;
    }
    
    return { success: true };
  },

  // Get user's API keys
  getByUser: async (userId) => {
    const result = await sql`SELECT provider, api_key FROM user_api_keys WHERE user_id = ${userId}`;
    
    // Convert to object format
    const apiKeys = {};
    result.forEach(row => {
      apiKeys[row.provider] = row.api_key;
    });
    return apiKeys;
  },

  // Delete API key
  delete: async (userId, provider) => {
    const result = await sql`DELETE FROM user_api_keys WHERE user_id = ${userId} AND provider = ${provider}`;
    return result;
  }
};

// Export the schema initializer for manual use
export { initializeSchema };