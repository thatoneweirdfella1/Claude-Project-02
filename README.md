# ADHD-to-AI Translator: Phase 1 Implementation

A full-stack application that translates ADHD-style rambling questions into optimized AI prompts, automatically routes them to appropriate models (Haiku, Opus Fast, Opus Thinking), and composes prompts with selected techniques.

## Architecture

### Backend (Python + FastAPI)
- **Translation Engine:** Analyzes input across 5 dimensions, applies 6-7 transformation operations
- **Routing Engine:** Applies 15-20 decision tree rules to route to appropriate model
- **Composition Engine:** Selects from 20+ prompt techniques and builds final prompt
- **Learning System:** Logs all decisions and patterns for future refinement
- **SQLite Database:** Persistent storage of questions, translations, routings, techniques, answers, and feedback

### Frontend (React + TypeScript + Fluent UI)
- Multi-step wizard: Input → Translate → Route → Techniques → Answer → Feedback
- Real-time feedback to backend
- Settings page for API key management
- Insights view for pattern analysis

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Anthropic API key (get at https://console.anthropic.com)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy .env.example)
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run server
python run.py
```

Server will start at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (copy .env.example)
cp .env.example .env

# Run dev server
npm run dev
```

Frontend will start at `http://localhost:3000`

## Usage

1. **Input:** Type a rambling ADHD-style question in the textarea
2. **Translate:** System analyzes and extracts the core question(s)
3. **Route:** System determines which model (Haiku/Opus Fast/Opus Thinking) is best
4. **Techniques:** System selects prompt engineering techniques to apply
5. **Answer:** See the final prompt that will be sent, then get the model's response
6. **Feedback:** Rate the answer (Good/Partial/Bad) for learning system

## Project Structure

```
claude-project-02/
├── backend/
│   ├── app/
│   │   ├── engines/
│   │   │   ├── translation/    # Translation Engine
│   │   │   ├── routing/        # Routing Engine
│   │   │   ├── composition/    # Composition Engine
│   │   │   └── learning/       # Learning System
│   │   ├── api/
│   │   │   ├── routes.py       # API endpoints
│   │   │   └── anthropic_client.py
│   │   ├── database.py         # SQLite schema and helpers
│   │   ├── models.py           # Pydantic request/response models
│   │   ├── config.py           # Configuration
│   │   └── main.py             # FastAPI app
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py                  # Dev server entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.tsx             # Main React component
│   │   ├── index.tsx
│   │   ├── services/
│   │   │   └── api.ts          # API client
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript interfaces
│   │   └── styles/
│   │       └── App.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
│
├── PHASE-1-BUILD-PLAN.md       # Full architectural plan
├── ADHD To AI - 01 - Specification Sheet.md
└── README.md                   # This file
```

## Key Features Implemented

### Translation Engine
- ✅ 5-dimension analysis (emotional vs logical, scope, assumptions, clarity, questions)
- ✅ 6-7 transformation operations (extract-core, reorder-context, normalize-emotional, clarify-scope, surface-assumptions, decompose-compound)
- ✅ Confidence scoring (0-100)
- ✅ Human-readable explanations

### Routing Engine
- ✅ 6-dimension analysis (complexity, domain, scope, certainty, time-sensitivity, depth)
- ✅ 15-20 decision tree rules
- ✅ Routes to Haiku (fast), Opus Fast (medium), or Opus Thinking (deep reasoning)
- ✅ Confidence scoring and reasoning

### Composition Engine
- ✅ 15+ prompt engineering techniques defined
- ✅ Intelligent technique selection based on domain
- ✅ Combination rules (safe pairs, conflicts, synergies)
- ✅ Final prompt generation with templates
- ✅ Token estimation

### Learning System
- ✅ Full pipeline logging to SQLite
- ✅ Feedback recording (good/partial/bad)
- ✅ Pattern analysis (after 50+ questions)
- ✅ Model performance tracking
- ✅ Insights dashboard (basic)

## API Endpoints

### POST /api/translate
Translate raw input into clear questions.
```json
Request: { "raw_input": "string" }
Response: {
  "success": true,
  "data": {
    "session_id": "uuid",
    "original_input": "string",
    "translations": [Translation],
    "analysis": Analysis
  }
}
```

### POST /api/route
Route translated question to appropriate model.
```json
Request: {
  "session_id": "uuid",
  "translated_text": "string",
  "domain": "string"
}
Response: {
  "success": true,
  "data": {
    "session_id": "uuid",
    "routing": RoutingData
  }
}
```

### POST /api/compose
Compose final prompt with selected techniques.
```json
Request: {
  "session_id": "uuid",
  "translated_text": "string",
  "routed_model": "haiku|opus-fast|opus-thinking",
  "domain": "string"
}
Response: {
  "success": true,
  "data": {
    "session_id": "uuid",
    "composition": CompositionData
  }
}
```

### POST /api/ask
Submit prompt to Claude and get answer.
```json
Request: {
  "session_id": "uuid",
  "final_prompt": "string",
  "routed_model": "string",
  "api_key": "string"
}
Response: {
  "success": true,
  "data": {
    "session_id": "uuid",
    "answer": "string",
    "tokens_used": number
  }
}
```

### POST /api/feedback
Record user feedback for learning.
```json
Request: {
  "answer_id": "uuid",
  "rating": "good|partial|bad",
  "notes": "string (optional)"
}
Response: {
  "success": true,
  "data": { "recorded": true }
}
```

### GET /api/insights
Get insights from learning system.
```json
Response: {
  "success": true,
  "data": {
    "model_performance": { ... },
    "patterns": [...],
    "recommendations": [...]
  }
}
```

## Database Schema

SQLite database with tables:
- `questions` - Raw inputs
- `translations` - Translated questions and analysis
- `routings` - Model routing decisions and dimensions
- `compositions` - Technique selections and prompts
- `answers` - Model responses
- `feedback` - User ratings and notes
- `settings` - User preferences

## Testing

Basic test structure in place. To run tests:

```bash
cd backend
pytest tests/
```

## Next Steps (Phase 2)

- User authentication (email/password)
- Cloud backend deployment
- Mobile app (Flutter or React Native)
- Advanced learning (ML-based pattern detection)
- Monetization (subscription tracking)
- Multi-user feedback aggregation

## Troubleshooting

**Backend not connecting:**
- Make sure backend is running: `cd backend && python run.py`
- Check that port 8000 is available
- Verify API key is set in `.env`

**Frontend build errors:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Make sure Node 18+ is installed

**API key errors:**
- Get API key from https://console.anthropic.com
- Add to `.env` file in backend
- Or add in Settings page in frontend

## License

MIT

## Support

For questions, see the specification documents:
- `PHASE-1-BUILD-PLAN.md` - Architecture and implementation roadmap
- `ADHD To AI - 01 - Specification Sheet.md` - Full product specification
