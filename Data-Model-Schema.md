# Data Model & Database Schema
## SQLite Structure for Phase 11+ Features

---

## TABLES OVERVIEW

### Existing (Phase 1-10)
- `questions` - Raw input
- `translations` - Translation results
- `routings` - Routing decisions
- `compositions` - Technique selections
- `answers` - Model responses
- `feedback` - User ratings
- `settings` - User preferences

### NEW (Phase 11)
- `dialogues` - Multi-AI conversations
- `dialogue_turns` - Individual turns in dialogue
- `accounts` - API key registry
- `granular_feedback` - Intermediate feedback (routing/techniques)
- `patterns` - Detected learning patterns
- `prompts` - Saved prompt library
- `variables` - User-defined substitution variables
- `context_items` - Loaded external context
- `checkpoints` - Conversation snapshots
- `activity_log` - Session activity timestamped

---

## TABLE SCHEMAS

### Table: `dialogues`

```sql
CREATE TABLE dialogues (
  id TEXT PRIMARY KEY,
  question_id TEXT,
  goal TEXT,  -- "solid_answer", "understand", "improve_idea", "decision", "debate"
  mode TEXT,  -- "adversarial", "socratic", "synthesis", "devils_advocate", "consensus"
  model_a TEXT,  -- "claude_a", "gpt_a", "perplexity_a"
  model_b TEXT,
  rounds_completed INT,
  stop_reason TEXT,  -- "consensus_reached", "weakness_found", etc.
  user_rating INT,  -- 1-5 stars
  user_comment TEXT,
  created_at DATETIME,
  completed_at DATETIME,
  dialogue_content TEXT  -- JSON array of turns
);
```

### Table: `dialogue_turns`

```sql
CREATE TABLE dialogue_turns (
  id TEXT PRIMARY KEY,
  dialogue_id TEXT,
  round INT,
  speaker TEXT,  -- "model_a" or "model_b"
  model_used TEXT,  -- actual model (may differ if account swapped)
  content TEXT,  -- Full response text
  tokens_used INT,
  created_at DATETIME,
  FOREIGN KEY(dialogue_id) REFERENCES dialogues(id)
);
```

### Table: `accounts`

```sql
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,  -- "claude_a", "gpt_a", etc.
  provider TEXT,  -- "anthropic", "openai", "perplexity"
  tier TEXT,  -- "free", "pro"
  api_key TEXT ENCRYPTED,  -- Encrypted storage
  tokens_available INT,
  tokens_used_this_session INT,
  status TEXT,  -- "active", "ready", "depleted"
  last_used DATETIME,
  created_at DATETIME
);
```

### Table: `granular_feedback`

```sql
CREATE TABLE granular_feedback (
  id TEXT PRIMARY KEY,
  question_id TEXT,
  feedback_type TEXT,  -- "routing", "technique"
  value TEXT,  -- "thumbs_down"
  routing_recommended TEXT,  -- if routing feedback
  routing_correct TEXT,  -- what user thought was better
  techniques_selected TEXT,  -- JSON if technique feedback
  created_at DATETIME,
  FOREIGN KEY(question_id) REFERENCES questions(id)
);
```

### Table: `patterns`

```sql
CREATE TABLE patterns (
  id TEXT PRIMARY KEY,
  pattern_type TEXT,  -- "routing_preference", "technique_effectiveness", "mode_preference"
  pattern_text TEXT,  -- "For career questions, users prefer Opus-Fast"
  confidence FLOAT,  -- 0-1.0
  data_points INT,  -- How many examples detected this
  created_at DATETIME,
  updated_at DATETIME
);
```

### Table: `prompts`

```sql
CREATE TABLE prompts (
  id TEXT PRIMARY KEY,
  name TEXT,
  content TEXT,
  created_at DATETIME,
  used_count INT
);
```

### Table: `variables`

```sql
CREATE TABLE variables (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE,  -- e.g., "project_name"
  value TEXT,
  created_at DATETIME
);
```

### Table: `context_items`

```sql
CREATE TABLE context_items (
  id TEXT PRIMARY KEY,
  type TEXT,  -- "text", "file", "url"
  title TEXT,
  content TEXT,
  enabled BOOLEAN,
  created_at DATETIME
);
```

### Table: `checkpoints`

```sql
CREATE TABLE checkpoints (
  id TEXT PRIMARY KEY,
  name TEXT,
  conversation_snapshot TEXT,  -- JSON of full conversation
  created_at DATETIME
);
```

### Table: `activity_log`

```sql
CREATE TABLE activity_log (
  id TEXT PRIMARY KEY,
  action TEXT,  -- "question_asked", "archived", "exported", etc.
  action_text TEXT,  -- "Question answered · 2000 tokens"
  created_at DATETIME
);
```

---

## INDEXES (For Performance)

```sql
CREATE INDEX idx_dialogues_question_id ON dialogues(question_id);
CREATE INDEX idx_dialogues_created ON dialogues(created_at);
CREATE INDEX idx_dialogue_turns_dialogue ON dialogue_turns(dialogue_id);
CREATE INDEX idx_granular_feedback_question ON granular_feedback(question_id);
CREATE INDEX idx_patterns_type ON patterns(pattern_type);
CREATE INDEX idx_context_enabled ON context_items(enabled);
CREATE INDEX idx_activity_created ON activity_log(created_at);
```

---

## JSON STRUCTURES

### `dialogue_content` (stored as JSON in `dialogues`)

```json
[
  {
    "round": 1,
    "speaker": "model_a",
    "model_used": "claude_a",
    "content": "Your proposal...",
    "tokens_used": 150,
    "timestamp": "2026-06-22T14:30:00Z"
  },
  {
    "round": 1,
    "speaker": "model_b",
    "model_used": "gpt_a",
    "content": "I'd strengthen...",
    "tokens_used": 180,
    "timestamp": "2026-06-22T14:30:15Z"
  },
  {
    "round": 2,
    "speaker": "model_a",
    "model_used": "claude_b",
    "content": "Good catch...",
    "tokens_used": 200,
    "swap_reason": "tokens_depleted",
    "timestamp": "2026-06-22T14:30:45Z"
  }
]
```

### `conversation_snapshot` (in `checkpoints`)

```json
{
  "turns": [
    {
      "role": "user",
      "content": "Can you help me...",
      "display": "Can you help me...",
      "state": { "emotion": "anxious", "rsd": "high" },
      "timestamp": "2026-06-22T14:00:00Z"
    },
    {
      "role": "assistant",
      "content": "[model response]",
      "display": "[formatted response]",
      "timestamp": "2026-06-22T14:00:30Z"
    }
  ],
  "metadata": {
    "model_used": "opus-fast",
    "total_tokens": 1500,
    "techniques_used": ["T01", "T03"],
    "context_loaded": ["meeting-notes", "budget-file"]
  }
}
```

---

## MIGRATIONS NEEDED

From Phase 1-10 schema to Phase 11+:

1. Add `granular_feedback` table (new)
2. Add `dialogues` table (new)
3. Add `dialogue_turns` table (new)
4. Add `accounts` table (new)
5. Add `patterns` table (new)
6. Add `prompts` table (new)
7. Add `variables` table (new)
8. Add `context_items` table (new)
9. Add `checkpoints` table (new)
10. Add `activity_log` table (new)
11. Modify `settings` to include new keys (quiet_mode, focus_mode, etc.)
12. Add indexes for performance

---

**Status: READY FOR PHASE 13 IMPLEMENTATION**
