-- Users table
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
);

-- Email verification table
CREATE TABLE IF NOT EXISTS email_verification (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  feedback_type TEXT NOT NULL, -- 'email_generation' or 'email_sender'
  feedback_data TEXT NOT NULL, -- JSON string of feedback
  ai_provider TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- User sessions table (simple session management)
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Email activity log
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
  status TEXT DEFAULT 'generated', -- generated, sent, failed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- API keys storage (encrypted)
CREATE TABLE IF NOT EXISTS user_api_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  provider TEXT NOT NULL, -- qwen, openai, deepseek, gemini
  api_key TEXT NOT NULL, -- Should be encrypted in production
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE(user_id, provider)
);