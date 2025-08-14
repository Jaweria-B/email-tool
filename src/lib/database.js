// lib/database.js
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

// Initialize connection
const sql = neon(process.env.DATABASE_URL);

// Initialize database tables
const initializeSchema = async () => {
  try {
    // Create users table with email_verified field
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        company TEXT,
        job_title TEXT,
        email_verified BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create email_verification table
    await sql`
      CREATE TABLE IF NOT EXISTS email_verification (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        verification_code TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email)
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

    // Create feedback table
    await sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        feedback_type TEXT NOT NULL,
        feedback_data TEXT NOT NULL,
        ai_provider TEXT,
        email_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )
    `;

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
};

// User operations
export const userDb = {
  // Create user (unverified initially)
  create: async (userData) => {
    const result = await sql`
      INSERT INTO users (name, email, company, job_title, email_verified, status)
      VALUES (${userData.name}, ${userData.email}, ${userData.company}, ${userData.job_title}, FALSE, 'pending')
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

  // Verify user email
  verifyEmail: async (email) => {
    const result = await sql`
      UPDATE users 
      SET email_verified = TRUE, status = 'active', updated_at = CURRENT_TIMESTAMP
      WHERE email = ${email}
      RETURNING *
    `;
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

// Email verification operations
export const verificationDb = {
  // Create verification code
  create: async (email, code) => {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Use upsert pattern
    await sql`
      INSERT INTO email_verification (email, verification_code, expires_at, attempts)
      VALUES (${email}, ${code}, ${expiresAt.toISOString()}, 0)
      ON CONFLICT (email) 
      DO UPDATE SET 
        verification_code = ${code}, 
        expires_at = ${expiresAt.toISOString()}, 
        attempts = 0,
        created_at = CURRENT_TIMESTAMP
    `;
    
    return true;
  },

  // Verify code
  verify: async (email, code) => {
    const result = await sql`
      SELECT * FROM email_verification 
      WHERE email = ${email} AND verification_code = ${code} AND expires_at > NOW()
    `;
    return result[0] || null;
  },

  // Increment attempts
  incrementAttempts: async (email) => {
    await sql`
      UPDATE email_verification 
      SET attempts = attempts + 1 
      WHERE email = ${email}
    `;
  },

  // Delete verification record
  delete: async (email) => {
    await sql`DELETE FROM email_verification WHERE email = ${email}`;
  },

  // Clean expired verifications
  cleanExpired: async () => {
    const result = await sql`DELETE FROM email_verification WHERE expires_at <= NOW()`;
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
  },
  
  // Get total count of generated emails
  getTotalCount: async () => {
    const result = await sql`SELECT COUNT(*) as count FROM email_activity`;
    return parseInt(result[0].count);
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

// Feedback operations
export const feedbackDb = {
  // Create feedback entry
  create: async (feedbackData) => {
    const result = await sql`
      INSERT INTO feedback 
      (user_id, feedback_type, feedback_data, ai_provider, email_sent)
      VALUES (${feedbackData.user_id}, ${feedbackData.feedback_type}, ${JSON.stringify(feedbackData.feedback_data)}, ${feedbackData.ai_provider}, ${feedbackData.email_sent})
      RETURNING id
    `;
    return { id: result[0].id };
  },

  // Get feedback by user
  getByUser: async (userId, feedbackType = null, limit = 50) => {
    let query;
    if (feedbackType) {
      query = sql`
        SELECT * FROM feedback 
        WHERE user_id = ${userId} AND feedback_type = ${feedbackType}
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT * FROM feedback 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `;
    }
    
    const result = await query;
    // Parse feedback_data JSON for each result
    return result.map(row => ({
      ...row,
      feedback_data: JSON.parse(row.feedback_data)
    }));
  },

  // Get all feedback for analytics
  getAll: async (limit = 100, offset = 0) => {
    const result = await sql`
      SELECT f.*, u.name as user_name, u.email as user_email
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return result.map(row => ({
      ...row,
      feedback_data: JSON.parse(row.feedback_data)
    }));
  },

  // Get feedback stats
  getStats: async () => {
    const totalFeedback = await sql`SELECT COUNT(*) as count FROM feedback`;
    const generationFeedback = await sql`SELECT COUNT(*) as count FROM feedback WHERE feedback_type = 'email_generation'`;
    const senderFeedback = await sql`SELECT COUNT(*) as count FROM feedback WHERE feedback_type = 'email_sender'`;
    
    return {
      total: totalFeedback[0].count,
      email_generation: generationFeedback[0].count,
      email_sender: senderFeedback[0].count
    };
  },

  // Delete feedback
  delete: async (id) => {
    const result = await sql`DELETE FROM feedback WHERE id = ${id}`;
    return result;
  }
};

// Export the schema initializer for manual use
export { initializeSchema };