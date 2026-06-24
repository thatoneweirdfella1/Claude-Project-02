# ADHD-to-AI Translator: Phase 1 Build Plan

## Overview

**Phase 1 Goal:** Build a fully functional local web app with all four engines from the specification implemented and working.

**Target Use Case:** User runs backend locally, opens web UI in browser, translates + routes + composes + gets answer + rates feedback. All data stored locally.

**Technology Stack:**
- **Backend:** Python 3.11+ + FastAPI + SQLite (no migrations needed for Phase 1, simple .db file)
- **Frontend:** React (or Vue if you prefer) + TypeScript + Fluent UI (reuse design from existing mockup)
- **Communication:** REST API (JSON over HTTP)
- **Local Storage:** SQLite for persistent logging, user preferences, feedback

**Phase 1 Duration Estimate:** 6–8 weeks of focused work (80–100 hours)

---

## Part 1: Directory Structure

```
claude-project-02/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── config.py               # Environment, API keys, paths
│   │   ├── database.py             # SQLite connection, schema
│   │   ├── models.py               # Pydantic models for API requests/responses
│   │   ├── engines/
│   │   │   ├── __init__.py
│   │   │   ├── translation/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── analyzer.py     # 5-dimension analysis
│   │   │   │   ├── operations.py   # 6-7 transformation operations
│   │   │   │   ├── scorer.py       # Confidence scoring
│   │   │   │   └── test_translation.py
│   │   │   ├── routing/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── decision_tree.py # 15-20 routing rules
│   │   │   │   ├── scorer.py       # Routing confidence
│   │   │   │   └── test_routing.py
│   │   │   ├── composition/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── technique_library.py # 20+ techniques
│   │   │   │   ├── combination_rules.py # Safe/conflict/synergy
│   │   │   │   ├── composer.py     # Template + injection logic
│   │   │   │   └── test_composition.py
│   │   │   └── learning/
│   │   │       ├── __init__.py
│   │   │       ├── logger.py       # Store decisions to SQLite
│   │   │       ├── analyzer.py     # Pattern analysis after 50+ Q
│   │   │       └── test_learning.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py           # /translate, /route, /compose, /ask, /feedback
│   │   │   └── anthropic_client.py # Wrapper for Claude API calls
│   │   ├── libraries/
│   │   │   ├── __init__.py
│   │   │   ├── prompts.py          # 40+ prompt templates
│   │   │   ├── techniques.py       # 20+ technique definitions
│   │   │   ├── questions.py        # Question type taxonomy
│   │   │   └── effectiveness.py    # Matrices (technique×type, model×type)
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── logging.py
│   │       └── validators.py
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── integration/            # End-to-end tests
│   │   ├── fixtures/               # Test data, sample questions
│   │   └── conftest.py
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py                      # Local dev server: python run.py
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Compose.tsx         # Main question input page
│   │   │   ├── Translate.tsx       # Translation review + accept/reject/edit
│   │   │   ├── Route.tsx           # Routing decision + override
│   │   │   ├── Compose.tsx         # (already named, or rename to Techniques.tsx)
│   │   │   ├── Answer.tsx          # Show final prompt + model answer
│   │   │   ├── Settings.tsx        # API key, model choice, preferences
│   │   │   └── History.tsx         # Past questions, feedback, patterns
│   │   ├── components/
│   │   │   ├── TranslationCard.tsx
│   │   │   ├── RoutingCard.tsx
│   │   │   ├── TechniqueGrid.tsx
│   │   │   ├── ConfidenceBar.tsx
│   │   │   ├── FeedbackPanel.tsx
│   │   │   └── StatusBanner.tsx
│   │   ├── services/
│   │   │   ├── api.ts             # Axios client for backend API
│   │   │   └── storage.ts         # localStorage helper
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript interfaces from backend models
│   │   ├── styles/
│   │   │   └── App.css            # Fluent UI styling
│   │   └── App.css
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example               # REACT_APP_API_URL=http://localhost:8000
│
├── PHASE-1-BUILD-PLAN.md          # This file
├── docs/
│   ├── API.md                      # Backend API endpoints and contracts
│   ├── ENGINES.md                  # Detailed engine designs
│   └── TESTING.md                  # Test strategy and cases
└── .gitignore
```

---

## Part 2: Technology Stack Details

### Backend Stack
- **FastAPI:** Async web framework, auto-generated OpenAPI docs, Pydantic for validation
- **SQLite:** Zero-config persistence. Schema created on startup.
- **Anthropic Python SDK:** For calling Claude models (Haiku, Opus, Sonnet)
- **Pydantic:** Type safety, request/response validation
- **pytest:** Unit and integration testing

### Frontend Stack
- **React + TypeScript:** Component-based UI, type safety
- **Axios:** HTTP client for backend API calls
- **Fluent UI (Microsoft):** Design system (reuse from existing mockup)
- **Vite:** Fast dev server and build tool (faster than CRA)

### Communication Protocol
All backend routes return JSON with this shape:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "metadata": { "processing_ms": 125 }
}
```

---

## Part 3: Engine-by-Engine Implementation Order

### Why This Order?

**Translation Engine first** because:
- It's the front of the pipeline (input → translation is the first user interaction)
- It's the most visible/interactive (accept/reject/edit UI is central to the concept)
- It's testable in isolation (50+ test cases exist in spec files)
- Building it forces us to design the backend/frontend communication pattern we'll reuse

**Then Routing Engine** because:
- It depends on the translation being done, but not on composition
- It's deterministic (rules + scoring, no external dependencies)
- It's the second user interaction (routes the translated questions)

**Then Composition Engine** because:
- It depends on translation + routing for context
- It's the most complex (20+ techniques, combination rules)
- It has the highest number of test cases (50+)

**Finally Learning System** because:
- It depends on all three engines completing and storing results
- It requires 50+ questions before patterns emerge
- It's the least time-critical (nice-to-have for Phase 1, essential for Phase 2)

---

### Engine 1: Translation Engine

**What It Does (From Spec):**
- Analyzes input across 5 dimensions: emotional vs. logical, unstated assumptions, scope ambiguity, stated vs. actual question, prerequisite knowledge gaps
- Applies 6–7 transformation operations: extract-core-question, reorder-context, normalize-emotional-language, clarify-scope, surface-assumptions, decompose-compound
- Scores confidence (0–100)
- Returns translated question(s) + confidence + explanation

**Files to Create:**
1. `backend/app/engines/translation/analyzer.py` — implements 5-dimension analysis
2. `backend/app/engines/translation/operations.py` — implements 6–7 operations (functions)
3. `backend/app/engines/translation/scorer.py` — computes confidence score

**API Contract:**
```
POST /api/translate
Request:
{
  "raw_input": "string"
}
Response:
{
  "success": true,
  "data": {
    "original_input": "string",
    "translations": [
      {
        "id": "uuid",
        "translated_text": "string",
        "operations_applied": ["extract-core-question", "reorder-context"],
        "confidence": 87,
        "explanation": "string"
      }
    ],
    "analysis": {
      "emotional_content": "high",
      "scope": "narrow",
      "num_questions": 1,
      "assumptions": ["assumption 1", "assumption 2"]
    }
  }
}
```

**Frontend Flow:**
1. User enters raw question in textarea
2. Click "Translate"
3. Backend analyzes and returns translations
4. UI shows:
   - Original input (read-only)
   - Each translation with explanation + confidence bar
   - Accept / Reject / Edit button for each
5. User accepts (or edits inline) → proceeds to Routing

**Test Cases to Implement:**
- Extract 50+ test cases from the spec files
- Example: "okay so like i've been thinking about..." → should parse into 3 separate questions
- Example: emotionally charged question → normalized version
- Confidence scoring: high confidence for clear questions, low for ambiguous ones

**Estimated Scope:** 400–600 lines of backend code + 300–400 lines of tests + 200–300 lines of frontend components

---

### Engine 2: Routing Engine

**What It Does (From Spec):**
- Analyzes translated questions across 6 dimensions: complexity, domain, scope, certainty, time sensitivity, depth requirement
- Applies 15–20 decision tree rules
- Routes each question to Haiku (fast), Opus fast (medium), or Opus thinking (deep)
- Scores routing confidence (0–100)
- Shows reasoning to user, allows override

**Files to Create:**
1. `backend/app/engines/routing/decision_tree.py` — implements 15–20 rules
2. `backend/app/engines/routing/scorer.py` — analyzes 6 dimensions, computes confidence

**API Contract:**
```
POST /api/route
Request:
{
  "translated_questions": [
    {
      "id": "uuid",
      "text": "string"
    }
  ]
}
Response:
{
  "success": true,
  "data": {
    "routings": [
      {
        "question_id": "uuid",
        "question_text": "string",
        "routed_model": "haiku" | "opus-fast" | "opus-thinking",
        "reasoning": "string",
        "confidence": 82,
        "dimensions": {
          "complexity": 4,
          "domain": "analytical",
          "scope": "narrow",
          "certainty": "high",
          "time_sensitivity": "medium",
          "depth_requirement": "surface"
        }
      }
    ]
  }
}
```

**Frontend Flow:**
1. User reviews translations (step from above)
2. Click "Route" or auto-proceed
3. Backend routes each question
4. UI shows:
   - Each question with routed model (Haiku icon, Opus fast icon, Opus thinking icon)
   - Reasoning for each routing
   - Confidence bars
   - "Override" button for each question (dropdown to choose different model)
5. User confirms or overrides → proceeds to Composition

**Test Cases to Implement:**
- Extract 100+ test cases from spec files
- Example: factual question + narrow scope → Haiku
- Example: ambiguous + novel + complex → Opus thinking
- Routing confidence scoring

**Estimated Scope:** 500–700 lines of backend code + 400–500 lines of tests + 250–350 lines of frontend components

---

### Engine 3: Composition Engine

**What It Does (From Spec):**
- Has a library of 20+ prompt engineering techniques (hallucination-reduction, chain-of-thought, quote-first, role-priming, RAG, few-shot, scope limitation, etc.)
- For each routed question, selects which techniques to apply
- Applies combination rules: safe pairs, conflicts, synergies, ordering dependencies
- Builds final prompt from template + techniques + question
- Shows final prompt to user before execution
- Submits to Claude API

**Files to Create:**
1. `backend/app/libraries/techniques.py` — defines 20+ techniques with metadata
2. `backend/app/libraries/prompts.py` — defines 40+ prompt templates (by model + domain)
3. `backend/app/engines/composition/composer.py` — selects techniques and builds prompt
4. `backend/app/engines/composition/combination_rules.py` — conflict/synergy logic

**API Contract:**
```
POST /api/compose
Request:
{
  "routings": [
    {
      "question_id": "uuid",
      "text": "string",
      "routed_model": "haiku",
      "overrides": {}  # optional manual techniques
    }
  ]
}
Response:
{
  "success": true,
  "data": {
    "compositions": [
      {
        "question_id": "uuid",
        "question_text": "string",
        "routed_model": "haiku",
        "techniques": [
          {
            "id": "chain-of-thought",
            "name": "Chain-of-Thought",
            "description": "Instruct model to reason step-by-step",
            "confidence": 88,
            "tokens_overhead": 120
          }
        ],
        "final_prompt": "string (the exact prompt that will be sent)",
        "estimated_tokens": 450,
        "confidence": 84
      }
    ]
  }
}
```

**Frontend Flow:**
1. User reviews routing (step from above)
2. Click "Compose"
3. Backend selects techniques and builds prompts
4. UI shows:
   - For each question: technique grid with technique cards (name, description, confidence)
   - Total token estimate
   - "Add technique" / "Remove technique" buttons
   - Final prompt in a collapsible read-only text area
5. User can add/remove techniques (triggers re-composition)
6. User confirms → proceeds to Answer

**Test Cases to Implement:**
- Extract 50+ test cases from spec files
- Example: simple factual question → selected techniques = quote-first + permission-to-say-no
- Example: complex reasoning → selected = chain-of-thought + structured-reasoning + self-verification
- Technique conflicts: e.g., can't use both "role-priming" and "give-opposite-viewpoint"
- Token overhead calculation

**Estimated Scope:** 600–800 lines of backend code (lots of technique definitions) + 400–500 lines of tests + 300–400 lines of frontend components

---

### Engine 4: Learning System

**What It Does (From Spec):**
- Logs every decision: original input, translation, routing, techniques, final prompt, model response, user feedback
- After 50+ questions, analyzes patterns
- Identifies which models work best for question types, which techniques improve answers
- Refines routing rules and technique selection based on patterns

**Files to Create:**
1. `backend/app/engines/learning/logger.py` — stores decisions to SQLite
2. `backend/app/engines/learning/analyzer.py` — pattern detection (heuristic-based)
3. `backend/app/database.py` — SQLite schema and ORM layer

**API Contract:**
```
POST /api/feedback
Request:
{
  "question_id": "uuid",
  "rating": "good" | "bad" | "partial",
  "notes": "string (optional)"
}
Response:
{
  "success": true,
  "data": {
    "recorded": true,
    "feedback_id": "uuid"
  }
}

GET /api/insights
Response:
{
  "success": true,
  "data": {
    "total_questions": 47,
    "patterns": [
      {
        "pattern": "Questions about Python routing get better results with Opus fast",
        "evidence": "12 questions, 75% positive feedback with Opus fast vs 60% with Haiku"
      }
    ],
    "technique_effectiveness": {
      "chain-of-thought": { "overall": 0.78, "by_model": {...} }
    },
    "model_preference": { "haiku": 0.65, "opus-fast": 0.82, "opus-thinking": 0.91 }
  }
}
```

**Frontend Flow:**
1. After model responds (next step)
2. User clicks rating button: "Good" / "Bad" / "Partial" + optional notes
3. UI sends feedback to backend
4. (Future) User can view "Insights" tab showing patterns

**Test Cases to Implement:**
- Extract 30–50 test cases
- Example: after 50 feedback entries, system detects "Topic X consistently routes to Model Y with better results"
- Confidence in pattern (e.g., "pattern is 15% better with 2 outliers, 75% confidence")

**Estimated Scope:** 300–400 lines of backend code + 200–300 lines of tests + basic frontend (History + Insights pages)

---

## Part 4: Cross-Cutting Concerns

### Database Schema (SQLite)

```sql
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  created_at DATETIME,
  raw_input TEXT,
  user_notes TEXT
);

CREATE TABLE translations (
  id TEXT PRIMARY KEY,
  question_id TEXT,
  translated_text TEXT,
  operations_applied TEXT,  -- JSON list
  confidence INT,
  user_action TEXT,  -- 'accepted', 'rejected', 'edited'
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE routings (
  id TEXT PRIMARY KEY,
  translation_id TEXT,
  routed_model TEXT,
  dimensions TEXT,  -- JSON object
  confidence INT,
  override_model TEXT,  -- if user overrode
  FOREIGN KEY (translation_id) REFERENCES translations(id)
);

CREATE TABLE compositions (
  id TEXT PRIMARY KEY,
  routing_id TEXT,
  techniques_selected TEXT,  -- JSON list
  final_prompt TEXT,
  token_estimate INT,
  confidence INT,
  FOREIGN KEY (routing_id) REFERENCES routings(id)
);

CREATE TABLE answers (
  id TEXT PRIMARY KEY,
  composition_id TEXT,
  model_response TEXT,
  tokens_used INT,
  generated_at DATETIME,
  FOREIGN KEY (composition_id) REFERENCES compositions(id)
);

CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  answer_id TEXT,
  rating TEXT,  -- 'good', 'bad', 'partial'
  notes TEXT,
  created_at DATETIME,
  FOREIGN KEY (answer_id) REFERENCES answers(id)
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

### API Key Management

- Store in `.env` file (never commit)
- Frontend: Settings page has input field to store API key in `localStorage` (user controls this, not backend)
- Backend: Accept API key as query param or header on each request: `Authorization: Bearer <key>`
- Or: Simple solution = frontend submits key with each request (not ideal long-term but OK for Phase 1)

### CORS & Local Dev

- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:3000` (Vite dev server) or `http://localhost:5173` (Vite default)
- Backend enables CORS for localhost

---

## Part 5: Implementation Roadmap

### Week 1: Setup & Translation Engine

**Days 1–2:** Backend project setup
- Create FastAPI app with basic route skeleton
- Set up SQLite and schema
- Create Pydantic models for all requests/responses
- Set up pytest and CI structure

**Days 3–5:** Translation Engine core logic
- Implement 5-dimension analyzer (heuristic-based)
- Implement 6–7 transformation operations
- Implement confidence scorer
- Wire to `/api/translate` endpoint

**Days 6–7:** Translation Engine frontend + E2E testing
- Build Compose page + TranslationCard component
- Accept/Reject/Edit UI
- 50+ translation test cases (unit + integration)
- Manual testing with real ADHD-style questions

### Week 2: Routing Engine

**Days 8–10:** Routing Engine core logic
- Implement 6-dimension analyzer
- Implement 15–20 decision tree rules
- Implement confidence scorer
- Wire to `/api/route` endpoint

**Days 11–12:** Routing Engine frontend + testing
- Build Route page + RoutingCard component
- Override UI (dropdown per question)
- 100+ routing test cases
- Manual testing

### Week 3: Composition Engine

**Days 13–16:** Composition Engine core logic
- Build technique library (define 20+ techniques)
- Build prompt templates library (40+ templates)
- Implement technique selection algorithm
- Implement combination rules (safe, conflicts, synergies, ordering)
- Implement composer (template + injection)
- Wire to `/api/compose` endpoint

**Days 17–19:** Composition Engine frontend + testing
- Build Techniques page + TechniqueGrid component
- Add/Remove technique UI
- Final prompt display (read-only)
- 50+ technique selection test cases

### Week 4: Learning System + Answer Flow

**Days 20–22:** Learning System
- Implement logger (store all decisions to SQLite)
- Implement basic pattern analyzer
- Wire feedback endpoints
- Build History + Insights pages (frontend)

**Days 23–25:** Answer flow + feedback
- Implement `/api/ask` endpoint (submits final prompt to Claude API)
- Display model response on Answer page
- Feedback buttons + submission
- End-to-end testing

### Week 5–6: Refinement, Testing, Documentation

- Integration test suite (30–50 tests)
- Failure mode tests
- Stress test with 100+ questions
- Polish UI (responsiveness, error handling, loading states)
- Write API documentation
- Write engine design documentation

### Week 7–8: Buffer + Launch Prep

- Bug fixes and refinement
- Local deployment docs
- User testing (have a few people try it)
- Plan for Phase 2 (mobile)

---

## Part 6: Acceptance Criteria for Phase 1

### Translation Engine
- [ ] 50+ test cases pass (unit + integration)
- [ ] User accepts translation without edit >80% of the time
- [ ] Edge cases handled (empty input, very long input, multiple languages)

### Routing Engine
- [ ] 100+ test cases pass
- [ ] Routing aligns with spec decision tree
- [ ] Override functionality works
- [ ] User can see reasoning and model is correct >85% of the time

### Composition Engine
- [ ] 50+ test cases pass
- [ ] Technique selection is sensible (user rarely wants to remove/add techniques)
- [ ] Final prompt looks good (clear, reasonable, matches the question)
- [ ] Token estimate is within 10% of actual

### Learning System
- [ ] Feedback is logged to SQLite
- [ ] After 50 questions, patterns are detectable (even if heuristic-based)
- [ ] Insights page shows meaningful trends

### End-to-End
- [ ] User can ask 1–10 questions in sequence
- [ ] Each question flows through all 4 engines
- [ ] Answer is relevant and high-quality
- [ ] Feedback is recorded
- [ ] No crashes or UI freezes

### Documentation
- [ ] API documentation (OpenAPI / Swagger visible at `/docs`)
- [ ] Engine design doc (how each engine works)
- [ ] Local setup doc (how to run backend + frontend)

---

## Part 7: Deferred to Phase 2

- User authentication (email/password)
- Cloud backend (AWS / GCP)
- Backend data persistence across devices
- Mobile apps (Flutter, React Native, or native)
- Monetization (subscription, tracking, analytics)
- Advanced learning (ML-based pattern detection)
- Multi-user feedback aggregation

---

## Part 8: Dependencies & Prerequisites

**Before Starting:**
- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Anthropic API key available
- [ ] Git configured
- [ ] SQLite3 available (comes with Python)

**Python packages (backend):**
```
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
anthropic==0.7.0
pytest==7.4.3
pytest-asyncio==0.21.1
```

**Node packages (frontend):**
```
react==18.2.0
typescript==5.3.3
axios==1.6.0
@fluentui/react==8.110.0
vite==5.0.0
```

---

## Summary

This Phase 1 plan:
1. **Splits the architecture** cleanly into backend (engines) and frontend (UI)
2. **Implements all four systems** from the spec
3. **Prioritizes translation first** (most visible, most testable, sets the pattern)
4. **Includes comprehensive testing** (50+ translation tests, 100+ routing, etc.)
5. **Maintains code clarity** with modular engines, separate concerns, documented APIs
6. **Is achievable in 6–8 weeks** of focused work
7. **Positions us for Phase 2** (mobile, cloud, monetization) without major refactoring

The plan is ready to review. Once approved, we'll start with **backend setup + Translation Engine** (Week 1).
