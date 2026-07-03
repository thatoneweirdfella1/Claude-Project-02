# API Endpoints Specification
## Complete REST API for Phase 11+ System

**Status: COMPLETE FOR PHASE 12 PLANNING**

---

## OVERVIEW

This specification covers all HTTP endpoints required to support Phase 11+ features. The API uses JSON for request/response bodies and follows RESTful conventions.

**Base URL:** `/api/v1`

**Authentication:** Bearer token (JWT) in `Authorization` header

**Error format:**
```json
{
  "error": "error_code",
  "message": "Human-readable message",
  "details": {}, // Optional, context-specific
  "timestamp": "2026-06-22T14:30:00Z"
}
```

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 POST /auth/register
Create new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "hashed_password",
  "name": "User Name"
}
```

**Response (201):**
```json
{
  "user_id": "usr_abc123",
  "email": "user@example.com",
  "name": "User Name",
  "created_at": "2026-06-22T14:30:00Z",
  "token": "jwt_token_here"
}
```

**Errors:** 409 (email exists), 400 (invalid input)

---

### 1.2 POST /auth/login
Authenticate user and return JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "hashed_password"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_here",
  "user_id": "usr_abc123",
  "expires_in": 86400
}
```

**Errors:** 401 (invalid credentials), 404 (user not found)

---

### 1.3 POST /auth/refresh
Refresh JWT token.

**Request:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "token": "new_jwt_token",
  "expires_in": 86400
}
```

**Errors:** 401 (invalid refresh token), 403 (token expired)

---

### 1.4 POST /auth/logout
Invalidate current token.

**Response (204):** No content

---

## 2. QUESTION & ROUTING ENDPOINTS

### 2.1 POST /questions
Create and process new question.

**Request:**
```json
{
  "text": "What should I do about my career?",
  "metadata": {
    "emotion": "anxious",
    "rsd_level": "high",
    "context": "considering job change"
  }
}
```

**Response (201):**
```json
{
  "question_id": "q_xyz789",
  "original_text": "What should I do about my career?",
  "translated_text": "I'm considering a job change and feel anxious. What are key decision factors?",
  "routing_decision": {
    "model": "opus-fast",
    "confidence": 0.87,
    "reason": "Career questions benefit from quick analysis with broad perspective"
  },
  "techniques": [
    {"id": "T01", "name": "System Role Definition", "description": "..."},
    {"id": "T03", "name": "Socratic Prompting", "description": "..."},
    {"id": "T04", "name": "Outcome Specification", "description": "..."}
  ],
  "created_at": "2026-06-22T14:30:00Z"
}
```

**Errors:** 400 (invalid input), 422 (unprocessable question)

---

### 2.2 POST /questions/{question_id}/retranslate
Re-translate a question with parameter options.

**Request:**
```json
{
  "options": {
    "decomposition_aggressiveness": "more_aggressive", // "normal" | "more_aggressive"
    "emotional_normalization": "less", // "normal" | "more" | "less"
    "compound_handling": "separate" // "together" | "separate"
  }
}
```

**Response (200):**
```json
{
  "question_id": "q_xyz789",
  "original_text": "What should I do about my career?",
  "translated_text": "Revised translation...",
  "translation_details": {
    "gaps_detected": ["decision_framework", "context_missing"],
    "operations_applied": ["emotional_normalization", "decomposition"],
    "compound_questions": null
  }
}
```

---

### 2.3 GET /questions/{question_id}
Retrieve question details.

**Response (200):**
```json
{
  "question_id": "q_xyz789",
  "original_text": "...",
  "translated_text": "...",
  "routing_decision": {...},
  "techniques": [...],
  "status": "answered", // "processing" | "answered" | "archived"
  "created_at": "2026-06-22T14:30:00Z",
  "completed_at": "2026-06-22T14:35:00Z"
}
```

---

### 2.4 POST /questions/{question_id}/reroute
Request different model for same question.

**Request:**
```json
{
  "preferred_model": "opus-thinking"
}
```

**Response (200):**
```json
{
  "question_id": "q_xyz789",
  "routing_decision": {
    "model": "opus-thinking",
    "reason": "User preference for deeper analysis"
  },
  "techniques": [...] // May change based on new model
}
```

---

## 3. TECHNIQUE ENDPOINTS

### 3.1 GET /techniques
List all available techniques.

**Query params:**
- `model` (optional): Filter by applicable model (haiku, opus-fast, opus-thinking)

**Response (200):**
```json
{
  "techniques": [
    {
      "id": "T01",
      "name": "System Role Definition",
      "description": "Explicitly define the assistant's role and expertise",
      "category": "foundation",
      "applicable_models": ["haiku", "opus-fast", "opus-thinking"],
      "conflict_with": ["T02"],
      "priority": 1
    },
    // ... more techniques
  ],
  "total": 28
}
```

---

### 3.2 POST /technique-stacks
Save custom technique combination.

**Request:**
```json
{
  "name": "My Research Stack",
  "description": "Stack for research questions",
  "technique_ids": ["T01", "T03", "T04", "T12"],
  "question_type": "research", // Optional, for auto-apply
  "auto_apply": true
}
```

**Response (201):**
```json
{
  "stack_id": "ts_abc123",
  "name": "My Research Stack",
  "technique_ids": ["T01", "T03", "T04", "T12"],
  "created_at": "2026-06-22T14:30:00Z"
}
```

---

### 3.3 GET /technique-stacks
List user's saved technique stacks.

**Response (200):**
```json
{
  "stacks": [
    {
      "stack_id": "ts_abc123",
      "name": "My Research Stack",
      "technique_ids": ["T01", "T03", "T04", "T12"],
      "usage_count": 5,
      "created_at": "2026-06-22T14:30:00Z"
    }
  ]
}
```

---

## 4. COMPOSITION & ANSWER ENDPOINTS

### 4.1 POST /questions/{question_id}/answer
Generate answer using routing/technique decisions.

**Request:**
```json
{
  "output_format": "prose", // "prose" | "json" | "markdown" | "bullets"
  "show_preview": true, // If true, return max_tokens=50 preview first
  "preview_only": false
}
```

**Response (201):**
```json
{
  "answer_id": "ans_def456",
  "question_id": "q_xyz789",
  "model_used": "opus-fast",
  "content": "Full answer text here...",
  "metadata": {
    "tokens_used": 1250,
    "latency_ms": 2340,
    "confidence": 0.92
  },
  "created_at": "2026-06-22T14:35:00Z"
}
```

**Errors:** 400 (question not found), 503 (model unavailable)

---

### 4.2 POST /answers/{answer_id}/regenerate
Generate new response with same model/prompt.

**Request:**
```json
{
  "seed": null // Optional, for reproducible results
}
```

**Response (201):** Same format as POST /questions/{id}/answer

---

### 4.3 GET /answers/{answer_id}
Retrieve full answer details.

**Response (200):**
```json
{
  "answer_id": "ans_def456",
  "question_id": "q_xyz789",
  "model_used": "opus-fast",
  "content": "...",
  "metadata": {
    "tokens_used": 1250,
    "latency_ms": 2340,
    "confidence": 0.92,
    "model_capacity": 200000,
    "stop_reason": "end_turn"
  },
  "rating": 5,
  "comment": "Very helpful",
  "created_at": "2026-06-22T14:35:00Z"
}
```

---

## 5. DIALOGUE ENDPOINTS

### 5.1 POST /dialogues
Create new multi-AI dialogue.

**Request:**
```json
{
  "question_id": "q_xyz789",
  "goal": "improve_idea", // "solid_answer", "understand", "improve_idea", "decision", "debate"
  "mode": "devils_advocate", // Or null to let system recommend
  "depth": "medium", // "surface" | "medium" | "deep"
  "user_position": "undecided", // "for" | "against" | "undecided"
  "model_a": "claude_a",
  "model_b": "gpt_a"
}
```

**Response (201):**
```json
{
  "dialogue_id": "d_ghi789",
  "question_id": "q_xyz789",
  "goal": "improve_idea",
  "mode": "devils_advocate",
  "mode_recommendation": {
    "primary": "devils_advocate",
    "alternative": "synthesis",
    "reasoning": "Devil's Advocate best for idea refinement"
  },
  "model_a": "claude_a",
  "model_b": "gpt_a",
  "status": "initiated", // "initiated" | "in_progress" | "completed" | "paused"
  "created_at": "2026-06-22T14:30:00Z"
}
```

---

### 5.2 POST /dialogues/{dialogue_id}/turn
Submit next turn in dialogue.

**Request:**
```json
{
  "action": "continue", // "continue" | "accept" | "pause" | "stop" | "rewind" | "take_over"
  "round": 1,
  "user_input": null // Only for "take_over" mode
}
```

**Response (200):**
```json
{
  "dialogue_id": "d_ghi789",
  "round": 2,
  "turns": [
    {
      "speaker": "model_a",
      "model_used": "claude_a",
      "content": "Your proposal is good...",
      "tokens_used": 150,
      "timestamp": "2026-06-22T14:30:00Z"
    },
    {
      "speaker": "model_b",
      "model_used": "gpt_a",
      "content": "I'd strengthen that...",
      "tokens_used": 180,
      "timestamp": "2026-06-22T14:30:15Z"
    }
  ],
  "stop_reason": null, // "consensus_reached" | "weakness_found" | etc
  "auto_stopped": false
}
```

---

### 5.3 GET /dialogues/{dialogue_id}
Retrieve full dialogue history.

**Response (200):**
```json
{
  "dialogue_id": "d_ghi789",
  "question_id": "q_xyz789",
  "goal": "improve_idea",
  "mode": "devils_advocate",
  "model_a": "claude_a",
  "model_b": "gpt_a",
  "rounds_completed": 2,
  "stop_reason": null,
  "status": "in_progress",
  "turns": [
    {
      "round": 1,
      "speaker": "model_a",
      "model_used": "claude_a",
      "content": "...",
      "tokens_used": 150,
      "timestamp": "2026-06-22T14:30:00Z"
    },
    {
      "round": 1,
      "speaker": "model_b",
      "model_used": "gpt_a",
      "content": "...",
      "tokens_used": 180,
      "timestamp": "2026-06-22T14:30:15Z"
    }
  ],
  "quality_score": 82,
  "user_rating": null,
  "created_at": "2026-06-22T14:30:00Z",
  "completed_at": null
}
```

---

### 5.4 POST /dialogues/{dialogue_id}/rating
Submit feedback on completed dialogue.

**Request:**
```json
{
  "rating": 5,
  "what_worked": ["found_weakness", "improved_idea", "explored_thoroughly"],
  "comment": "The phased rollout suggestion was key insight",
  "tags": ["career-decision", "important"]
}
```

**Response (200):**
```json
{
  "dialogue_id": "d_ghi789",
  "rating": 5,
  "feedback_recorded": true,
  "timestamp": "2026-06-22T14:40:00Z"
}
```

---

### 5.5 POST /dialogues/{dialogue_id}/rewind
Branch dialogue from a previous round.

**Request:**
```json
{
  "from_round": 1,
  "alternative_input": "Let me retry that response..."
}
```

**Response (201):**
```json
{
  "dialogue_id": "d_ghi789_branch1",
  "parent_dialogue_id": "d_ghi789",
  "from_round": 1,
  "branch_reason": "user_retry",
  "turns": [...] // New dialogue starting from round 2
}
```

---

## 6. FEEDBACK ENDPOINTS

### 6.1 POST /feedback/answer
Submit final answer rating and feedback.

**Request:**
```json
{
  "question_id": "q_xyz789",
  "answer_id": "ans_def456",
  "rating": 4,
  "comment": "Good but missed one aspect",
  "details": {
    "too_long": false,
    "wrong_model": false,
    "missing_detail": true,
    "hallucination": false,
    "format_issue": false
  }
}
```

**Response (201):**
```json
{
  "feedback_id": "fb_jkl012",
  "question_id": "q_xyz789",
  "answer_id": "ans_def456",
  "rating": 4,
  "recorded_at": "2026-06-22T14:40:00Z"
}
```

---

### 6.2 POST /feedback/routing
Submit thumbs-down on routing decision.

**Request:**
```json
{
  "question_id": "q_xyz789",
  "routing_recommended": "opus-fast",
  "user_rated": "thumbs-down",
  "model_preferred": "opus-thinking", // Optional
  "comment": "This needed deeper analysis"
}
```

**Response (201):**
```json
{
  "feedback_id": "fb_mno345",
  "question_id": "q_xyz789",
  "feedback_type": "routing",
  "value": "thumbs-down",
  "routing_recommended": "opus-fast",
  "routing_preferred": "opus-thinking",
  "recorded_at": "2026-06-22T14:35:00Z"
}
```

---

### 6.3 POST /feedback/techniques
Submit thumbs-down on technique selection.

**Request:**
```json
{
  "question_id": "q_xyz789",
  "techniques_selected": ["T03", "T01", "T04"],
  "user_rated": "thumbs-down",
  "techniques_preferred": ["T02", "T05", "T09"], // Optional
  "comment": "These techniques conflicted"
}
```

**Response (201):**
```json
{
  "feedback_id": "fb_pqr678",
  "question_id": "q_xyz789",
  "feedback_type": "technique",
  "value": "thumbs-down",
  "techniques_selected": ["T03", "T01", "T04"],
  "recorded_at": "2026-06-22T14:35:00Z"
}
```

---

### 6.4 POST /feedback/update/{feedback_id}
Update existing feedback rating.

**Request:**
```json
{
  "rating": 5,
  "comment": "Actually this was perfect"
}
```

**Response (200):**
```json
{
  "feedback_id": "fb_jkl012",
  "rating": 5,
  "updated_at": "2026-06-22T15:00:00Z"
}
```

---

## 7. ACCOUNT & TOKEN ENDPOINTS

### 7.1 GET /accounts
List user's available API accounts.

**Response (200):**
```json
{
  "accounts": [
    {
      "id": "claude_a",
      "provider": "anthropic",
      "tier": "free",
      "tokens_available": 5000,
      "tokens_used_this_session": 2340,
      "status": "active", // "active" | "ready" | "depleted"
      "last_used": "2026-06-22T14:35:00Z",
      "created_at": "2026-06-22T00:00:00Z"
    },
    {
      "id": "claude_b",
      "provider": "anthropic",
      "tier": "free",
      "tokens_available": 8000,
      "tokens_used_this_session": 0,
      "status": "ready",
      "last_used": null,
      "created_at": "2026-06-22T00:00:00Z"
    }
  ],
  "total_available": 13000,
  "total_used_session": 2340
}
```

---

### 7.2 POST /accounts
Add custom API account (Tier M5+).

**Request:**
```json
{
  "provider": "openai", // "anthropic" | "openai" | "perplexity"
  "api_key": "sk_...", // Will be encrypted in storage
  "alias": "My GPT Account"
}
```

**Response (201):**
```json
{
  "id": "custom_gpt_001",
  "provider": "openai",
  "alias": "My GPT Account",
  "tokens_available": 150000,
  "status": "active",
  "created_at": "2026-06-22T14:50:00Z"
}
```

---

### 7.3 POST /accounts/{account_id}/rotate
Manually trigger account rotation.

**Request:**
```json
{
  "next_account_id": "gpt_a" // Optional, pick specific next account
}
```

**Response (200):**
```json
{
  "previous_account": "claude_a",
  "current_account": "gpt_a",
  "reason": "manual_rotation",
  "rotated_at": "2026-06-22T14:55:00Z"
}
```

---

### 7.4 GET /accounts/token-status
Get real-time token availability across all accounts.

**Response (200):**
```json
{
  "accounts": [
    {
      "id": "claude_a",
      "tokens_available": 2660,
      "status": "active",
      "warning": true, // Will trigger auto-swap soon
      "estimated_swaps": 1
    }
  ],
  "session_tokens_used": 2340,
  "current_account": "claude_a"
}
```

---

## 8. HISTORY & SEARCH ENDPOINTS

### 8.1 GET /history
List user's question/answer history.

**Query params:**
- `limit` (default 20): Results per page
- `offset` (default 0): Pagination offset
- `search` (optional): Search by text
- `filter_model` (optional): Filter by model (claude, gpt, etc)
- `filter_rating` (optional): Filter by rating (1-5)
- `filter_date_from` (optional): Start date (ISO 8601)
- `filter_date_to` (optional): End date (ISO 8601)
- `filter_question_type` (optional): Filter by inferred type
- `sort_by` (optional): "recency" | "rating" | "usefulness"
- `tags` (optional): Filter by tags (comma-separated)

**Response (200):**
```json
{
  "items": [
    {
      "question_id": "q_xyz789",
      "original_text": "What should I do...",
      "model_used": "opus-fast",
      "rating": 5,
      "created_at": "2026-06-22T14:30:00Z",
      "tags": ["career", "important"]
    }
  ],
  "total": 127,
  "limit": 20,
  "offset": 0
}
```

---

### 8.2 GET /history/dialogues
List user's dialogue history.

**Query params:**
- `limit` (default 20)
- `offset` (default 0)
- `search` (optional)
- `filter_goal` (optional)
- `filter_mode` (optional)
- `filter_rating` (optional)
- `sort_by` (optional): "recency" | "rating"

**Response (200):**
```json
{
  "dialogues": [
    {
      "dialogue_id": "d_ghi789",
      "goal": "improve_idea",
      "mode": "devils_advocate",
      "models_used": ["claude_a", "gpt_a"],
      "rating": 5,
      "created_at": "2026-06-22T14:30:00Z",
      "summary": "Refined product launch proposal through phased approach",
      "tags": ["product", "important"]
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

### 8.3 POST /history/questions/similar
Find similar past questions.

**Request:**
```json
{
  "question_id": "q_xyz789",
  "limit": 5
}
```

**Response (200):**
```json
{
  "similar_questions": [
    {
      "question_id": "q_abc111",
      "text": "How do I change careers in tech?",
      "similarity_score": 0.92,
      "rating_on_similar": 4,
      "created_at": "2026-06-15T10:00:00Z"
    }
  ]
}
```

---

### 8.4 GET /history/tags
List all user's tags with usage counts.

**Response (200):**
```json
{
  "tags": [
    {
      "tag": "career",
      "usage_count": 12,
      "last_used": "2026-06-22T14:30:00Z"
    },
    {
      "tag": "product",
      "usage_count": 8,
      "last_used": "2026-06-20T09:15:00Z"
    }
  ]
}
```

---

### 8.5 POST /history/export
Export dialogue or question in specified format.

**Request:**
```json
{
  "dialogue_id": "d_ghi789", // OR question_id
  "format": "markdown" // "markdown" | "text" | "json"
}
```

**Response (200):**
```json
{
  "format": "markdown",
  "content": "# Multi-AI Dialogue\n\n## Goal: Improve Idea...",
  "filename": "dialogue_d_ghi789.md"
}
```

---

## 9. PATTERNS & LEARNING ENDPOINTS

### 9.1 GET /patterns
List detected learning patterns.

**Query params:**
- `pattern_type` (optional): "routing_preference" | "technique_effectiveness" | "mode_preference" | "model_performance"

**Response (200):**
```json
{
  "patterns": [
    {
      "pattern_id": "p_stu901",
      "pattern_type": "routing_preference",
      "pattern_text": "For career questions, users prefer Opus-Thinking (85% of cases)",
      "confidence": 0.85,
      "data_points": 17,
      "user_action": null, // null | "apply" | "dismiss"
      "created_at": "2026-06-15T00:00:00Z",
      "updated_at": "2026-06-22T10:00:00Z"
    }
  ]
}
```

---

### 9.2 POST /patterns/{pattern_id}/action
User accepts or dismisses a pattern suggestion.

**Request:**
```json
{
  "action": "apply", // "apply" | "dismiss"
  "reason": "I agree with this preference" // Optional
}
```

**Response (200):**
```json
{
  "pattern_id": "p_stu901",
  "action_taken": "apply",
  "will_apply_to_future": true,
  "updated_at": "2026-06-22T14:55:00Z"
}
```

---

### 9.3 GET /patterns/quarterly-summary
Get quarterly pattern analysis.

**Query params:**
- `quarter` (optional): "Q1-2026" | "Q2-2026" (default: current quarter)

**Response (200):**
```json
{
  "quarter": "Q2-2026",
  "summary": "You've asked 127 questions this quarter. Key insights...",
  "patterns": [
    {
      "category": "Model Performance",
      "findings": "Opus-Fast consistently rated higher for research questions",
      "recommendation": "Consider making it default for that type"
    }
  ],
  "generated_at": "2026-06-22T00:00:00Z"
}
```

---

## 10. SETTINGS & PREFERENCES ENDPOINTS

### 10.1 GET /settings
Get user's current settings.

**Response (200):**
```json
{
  "user_id": "usr_abc123",
  "default_model": "opus-fast",
  "transparency_level": "full", // "minimal" | "normal" | "full"
  "feedback_style": "explicit", // "explicit" | "inferred"
  "technique_limits": {
    "haiku": 6,
    "opus_fast": 9,
    "opus_thinking": 6
  },
  "quiet_mode": false,
  "focus_mode": false,
  "adhd_mode_enabled": false,
  "adhd_mode_settings": {
    "high_contrast": false,
    "reduce_animations": false,
    "plain_language": false,
    "large_text": false,
    "hide_advanced_buttons": false
  },
  "output_format_default": "prose",
  "emotional_normalization": true,
  "markdown_export_default": true,
  "updated_at": "2026-06-22T10:00:00Z"
}
```

---

### 10.2 POST /settings
Update user settings.

**Request:**
```json
{
  "default_model": "opus-thinking",
  "transparency_level": "normal",
  "quiet_mode": true,
  "adhd_mode_settings": {
    "high_contrast": true,
    "reduce_animations": true,
    "plain_language": true
  }
}
```

**Response (200):** Returns updated settings object

---

### 10.3 GET /settings/presets
Get available preset configurations.

**Response (200):**
```json
{
  "presets": [
    {
      "id": "power_user",
      "name": "Power User",
      "description": "Full visibility into all system decisions",
      "settings": {
        "transparency_level": "full",
        "feedback_style": "explicit",
        "adhd_mode_enabled": false
      }
    },
    {
      "id": "simple",
      "name": "Simple Mode",
      "description": "Minimal options, just answers",
      "settings": {
        "transparency_level": "minimal",
        "feedback_style": "inferred",
        "hide_advanced_buttons": true
      }
    },
    {
      "id": "adhd_optimized",
      "name": "ADHD-Optimized",
      "description": "High contrast, plain language, fewer distractions",
      "settings": {
        "adhd_mode_enabled": true,
        "high_contrast": true,
        "reduce_animations": true,
        "plain_language": true
      }
    }
  ]
}
```

---

### 10.4 POST /settings/presets/{preset_id}/apply
Apply a preset configuration.

**Response (200):** Returns updated settings

---

### 10.5 GET /settings/milestones
Get user's current progress on feature unlock milestones.

**Response (200):**
```json
{
  "current_milestone": 3,
  "milestones": [
    {
      "id": 1,
      "threshold": 0,
      "name": "Day 1 (First Use)",
      "unlocked": true,
      "unlocked_at": "2026-06-01T10:30:00Z",
      "features": ["basic_mode", "5star_feedback"]
    },
    {
      "id": 2,
      "threshold": 10,
      "name": "After 10 Questions",
      "unlocked": true,
      "unlocked_at": "2026-06-05T14:20:00Z",
      "features": ["technique_visibility", "custom_multi_ai_goals", "history_screen"]
    },
    {
      "id": 3,
      "threshold": 25,
      "name": "After 25 Questions",
      "unlocked": true,
      "unlocked_at": "2026-06-15T09:00:00Z",
      "features": ["advanced_routing", "template_library", "patterns_tab"]
    },
    {
      "id": 4,
      "threshold": 50,
      "name": "After 50 Questions",
      "unlocked": false,
      "features": ["dialogue_branching", "focus_mode", "custom_technique_stacks"]
    },
    {
      "id": 5,
      "threshold": 100,
      "name": "After 100 Questions",
      "unlocked": false,
      "features": ["account_management", "custom_dialogue_modes", "analytics_dashboard"]
    }
  ],
  "questions_asked": 23,
  "progress_to_next": 2 // Questions until next milestone
}
```

---

## 11. CHECKPOINTS & RECOVERY ENDPOINTS

### 11.1 POST /checkpoints
Save conversation snapshot.

**Request:**
```json
{
  "name": "Before refinement",
  "description": "Saved before attempt 2 at product proposal"
}
```

**Response (201):**
```json
{
  "checkpoint_id": "cp_vwx234",
  "name": "Before refinement",
  "conversation_snapshot": {...}, // Full JSON of conversation state
  "created_at": "2026-06-22T14:50:00Z"
}
```

---

### 11.2 GET /checkpoints
List user's conversation checkpoints.

**Response (200):**
```json
{
  "checkpoints": [
    {
      "checkpoint_id": "cp_vwx234",
      "name": "Before refinement",
      "created_at": "2026-06-22T14:50:00Z",
      "question_summary": "How should I launch the new feature?"
    }
  ]
}
```

---

### 11.3 POST /checkpoints/{checkpoint_id}/restore
Restore conversation from checkpoint.

**Response (200):**
```json
{
  "checkpoint_id": "cp_vwx234",
  "restored_at": "2026-06-22T15:00:00Z",
  "conversation_state_restored": true,
  "message": "Conversation restored. Ready to continue."
}
```

---

## 12. ACTIVITY LOG ENDPOINT

### 12.1 GET /activity-log
Get timestamped activity history.

**Query params:**
- `limit` (default 50)
- `offset` (default 0)
- `filter_action` (optional): "question_asked", "answer_rated", "dialogue_completed", etc.

**Response (200):**
```json
{
  "activities": [
    {
      "id": "act_yz1234",
      "action": "question_asked",
      "action_text": "Question answered · 2000 tokens",
      "created_at": "2026-06-22T14:30:00Z"
    },
    {
      "id": "act_ab5678",
      "action": "dialogue_completed",
      "action_text": "Multi-AI dialogue · 5 rounds · Rated 5 stars",
      "created_at": "2026-06-22T14:55:00Z"
    }
  ],
  "total": 456
}
```

---

## 13. ERROR HANDLING

### Standard HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET, successful update |
| 201 | Created | Resource created (POST) |
| 204 | No Content | Successful DELETE or logout |
| 400 | Bad Request | Invalid input format |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Email already exists, etc |
| 422 | Unprocessable | Valid format but cannot process (e.g., question too complex) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |
| 503 | Service Unavailable | Model API temporarily down |

### Error Response Format

```json
{
  "error": "INVALID_INPUT",
  "message": "Question text is required",
  "details": {
    "field": "text",
    "requirement": "string, 10-5000 characters"
  },
  "timestamp": "2026-06-22T14:30:00Z",
  "request_id": "req_abc123" // For support debugging
}
```

---

## 14. RATE LIMITING

**Endpoints have per-user rate limits:**

- Auth endpoints: 5 req/min per IP
- Question creation: 50 req/hour per user
- Dialogue turns: 100 req/hour per user
- Read endpoints (history, patterns): 200 req/hour per user
- Settings: 30 req/hour per user

**Headers in response:**
```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1624368600
```

---

## 15. PAGINATION

All list endpoints support pagination:

**Query params:**
- `limit`: Items per page (default 20, max 100)
- `offset`: Starting position (default 0)

**Response includes:**
```json
{
  "items": [...],
  "total": 127,
  "limit": 20,
  "offset": 0,
  "has_more": true,
  "next_offset": 20
}
```

---

## 16. WEBHOOK EVENTS (Optional, for v1.2+)

Endpoints that fire webhook events if configured:
- POST /dialogues/{id}/turn (dialogue_turn_created)
- POST /feedback/* (feedback_recorded)
- POST /patterns/{id}/action (pattern_updated)

---

**Status: COMPLETE**

**Next task: Component Breakdown (detailed UI sections)**
