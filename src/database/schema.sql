-- Phase 11+ Database Schema
-- SQLite schema for multi-AI dialogue system

-- Existing tables (Phase 1-10) - assuming already exist
-- questions, translations, routings, compositions, answers, feedback, settings

-- NEW TABLES FOR PHASE 11+

-- Dialogues: Multi-AI conversation metadata
CREATE TABLE IF NOT EXISTS dialogues (
  id TEXT PRIMARY KEY,
  question_id TEXT,
  goal TEXT,
  mode TEXT,
  model_a TEXT,
  model_b TEXT,
  rounds_completed INTEGER DEFAULT 0,
  stop_reason TEXT,
  user_rating INTEGER,
  user_comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  dialogue_content TEXT,
  FOREIGN KEY(question_id) REFERENCES questions(id)
);

-- Dialogue turns: Individual responses in dialogue
CREATE TABLE IF NOT EXISTS dialogue_turns (
  id TEXT PRIMARY KEY,
  dialogue_id TEXT,
  round INTEGER,
  speaker TEXT,
  model_used TEXT,
  content TEXT,
  tokens_used INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(dialogue_id) REFERENCES dialogues(id)
);

-- Accounts: API key registry for account rotation
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  provider TEXT,
  tier TEXT,
  api_key TEXT,
  tokens_available INTEGER,
  tokens_used_this_session INTEGER DEFAULT 0,
  status TEXT,
  last_used DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Granular feedback: Intermediate step feedback (routing/techniques)
CREATE TABLE IF NOT EXISTS granular_feedback (
  id TEXT PRIMARY KEY,
  question_id TEXT,
  feedback_type TEXT,
  value TEXT,
  routing_recommended TEXT,
  routing_correct TEXT,
  techniques_selected TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(question_id) REFERENCES questions(id)
);

-- Patterns: Detected learning patterns
CREATE TABLE IF NOT EXISTS patterns (
  id TEXT PRIMARY KEY,
  pattern_type TEXT,
  pattern_text TEXT,
  confidence REAL,
  data_points INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Prompts: Saved prompt library
CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  name TEXT,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  used_count INTEGER DEFAULT 0
);

-- Variables: User-defined substitution variables
CREATE TABLE IF NOT EXISTS variables (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE,
  value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Context items: Loaded external context
CREATE TABLE IF NOT EXISTS context_items (
  id TEXT PRIMARY KEY,
  type TEXT,
  title TEXT,
  content TEXT,
  enabled BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Checkpoints: Conversation snapshots
CREATE TABLE IF NOT EXISTS checkpoints (
  id TEXT PRIMARY KEY,
  name TEXT,
  conversation_snapshot TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activity log: Session activity timestamped
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  action TEXT,
  action_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE

CREATE INDEX IF NOT EXISTS idx_dialogues_question_id ON dialogues(question_id);
CREATE INDEX IF NOT EXISTS idx_dialogues_created ON dialogues(created_at);
CREATE INDEX IF NOT EXISTS idx_dialogue_turns_dialogue ON dialogue_turns(dialogue_id);
CREATE INDEX IF NOT EXISTS idx_granular_feedback_question ON granular_feedback(question_id);
CREATE INDEX IF NOT EXISTS idx_patterns_type ON patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_context_enabled ON context_items(enabled);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at);
